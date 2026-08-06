import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getCategoryById } from '@/constants/categories';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import type { Transaction } from '@/db/database';

export async function exportTransactionsToCSV(
  transactions: Transaction[], 
  monthLabel: string, 
  userName: string = 'Aguss'
): Promise<void> {
  if (transactions.length === 0) return;

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const netBalance = totalIncome - totalExpense;

  // Professional CSV Header & Summary Section
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  csvContent += '==================================================\n';
  csvContent += `GUITA APP - REPORTE FINANCIERO MENSUAL\n`;
  csvContent += `Usuario:;${userName}\n`;
  csvContent += `Período:;${monthLabel}\n`;
  csvContent += `Fecha de generación:;${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}\n`;
  csvContent += '==================================================\n\n';

  csvContent += `RESUMEN EJECUTIVO\n`;
  csvContent += `Total Ingresos:;${formatCurrency(totalIncome)}\n`;
  csvContent += `Total Gastos:;${formatCurrency(totalExpense)}\n`;
  csvContent += `Balance Neto:;${formatCurrency(netBalance)}\n`;
  csvContent += `Total Movimientos:;${transactions.length}\n\n`;

  csvContent += 'DETALLE DE MOVIMIENTOS\n';
  csvContent += 'ID;Fecha;Tipo;Categoría;Descripción;Monto ARS\n';

  const rows = transactions.map(t => {
    const catName = getCategoryById(t.category)?.name || t.category;
    const typeLabel = t.type === 'income' ? 'Ingreso' : 'Gasto';
    const cleanDesc = (t.description || 'Sin descripción').replace(/;/g, ',');
    return `${t.id};"${formatShortDate(t.date)}";"${typeLabel}";"${catName}";"${cleanDesc}";${t.amount}`;
  }).join('\n');

  csvContent += rows + '\n\n';
  csvContent += '==================================================\n';
  csvContent += 'Generado automáticamente por Guita App\n';

  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `guita_reporte_${monthLabel.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const fileName = `guita_reporte_${monthLabel.replace(/\s+/g, '_')}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: `Exportar reporte ${monthLabel} - Guita`,
        UTI: 'public.comma-separated-values-text',
      });
    }
  }
}
