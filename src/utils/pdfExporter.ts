import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { getCategoryById } from '@/constants/categories';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import type { Transaction } from '@/db/database';

export async function generatePDFReport(
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

  const rowsHtml = transactions.map((t, idx) => {
    const cat = getCategoryById(t.category);
    const catName = cat?.name || t.category;
    const catColor = cat?.color || '#6C63FF';
    const isIncome = t.type === 'income';
    const bg = idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
    const amountColor = isIncome ? '#00B386' : '#E85555';
    const sign = isIncome ? '+' : '-';

    return `
      <tr style="background-color: ${bg};">
        <td style="padding: 12px; font-size: 13px; color: #475569;">${formatShortDate(t.date)}</td>
        <td style="padding: 12px;">
          <span style="background-color: ${catColor}15; color: ${catColor}; font-weight: 700; padding: 4px 10px; border-radius: 20px; font-size: 11px; display: inline-block;">
            ${catName}
          </span>
        </td>
        <td style="padding: 12px; font-size: 13px; color: #1E293B; font-weight: 500;">${t.description || 'Sin descripción'}</td>
        <td style="padding: 12px; font-size: 13px; text-align: right; font-weight: 700; color: ${amountColor};">
          ${sign} ${formatCurrency(t.amount)}
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 30px;
            color: #1E293B;
            background-color: #FFFFFF;
          }
          .header {
            background: linear-gradient(135deg, #6C63FF 0%, #9F7AEA 100%);
            padding: 30px;
            border-radius: 16px;
            color: white;
            margin-bottom: 24px;
            box-shadow: 0 10px 25px rgba(108, 99, 255, 0.2);
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .logo {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .doc-title {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            opacity: 0.9;
            font-weight: 600;
          }
          .meta-grid {
            display: flex;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.2);
            gap: 30px;
          }
          .meta-item {
            font-size: 12px;
          }
          .meta-label {
            opacity: 0.8;
            margin-bottom: 2px;
          }
          .meta-value {
            font-weight: 700;
            font-size: 14px;
          }
          
          .cards-row {
            display: flex;
            gap: 15px;
            margin-bottom: 30px;
          }
          .card {
            flex: 1;
            padding: 18px;
            border-radius: 12px;
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
          }
          .card-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #64748B;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .card-value {
            font-size: 20px;
            font-weight: 800;
          }

          .table-container {
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            overflow: hidden;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background-color: #F1F5F9;
            color: #475569;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px;
            text-align: left;
            font-weight: 700;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>

        <!-- Header -->
        <div class="header">
          <div class="header-top">
            <div class="logo">Guita 💰</div>
            <div class="doc-title">Reporte Financiero Mensual</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Usuario</div>
              <div class="meta-value">${userName}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Período</div>
              <div class="meta-value">${monthLabel}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Fecha Emisión</div>
              <div class="meta-value">${new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>
        </div>

        <!-- Cards Row -->
        <div class="cards-row">
          <div class="card">
            <div class="card-label">Total Ingresos</div>
            <div class="card-value" style="color: #00B386;">${formatCurrency(totalIncome)}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Gastos</div>
            <div class="card-value" style="color: #E85555;">${formatCurrency(totalExpense)}</div>
          </div>
          <div class="card">
            <div class="card-label">Balance Neto</div>
            <div class="card-value" style="color: ${netBalance >= 0 ? '#00B386' : '#E85555'};">${formatCurrency(netBalance)}</div>
          </div>
        </div>

        <!-- Movimientos Table -->
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #0F172A;">
          Detalle de Movimientos (${transactions.length})
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th style="text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div class="footer">
          Documento generado automáticamente por <strong>Guita App</strong> — Finanzas Personales
        </div>

      </body>
    </html>
  `;

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  } else {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Guita - Reporte PDF ${monthLabel}`,
      UTI: 'com.adobe.pdf',
    });
  }
}
