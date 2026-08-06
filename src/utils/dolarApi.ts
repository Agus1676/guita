export interface DolarRate {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface DolarData {
  blue?: DolarRate;
  oficial?: DolarRate;
}

export async function fetchDolarRates(): Promise<DolarData> {
  try {
    const response = await fetch('https://dolarapi.com/v1/dolares');
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();

    const blueData = data.find((item: any) => item.casa === 'blue');
    const oficialData = data.find((item: any) => item.casa === 'oficial');

    return {
      blue: blueData ? { compra: blueData.compra, venta: blueData.venta, fechaActualizacion: blueData.fechaActualizacion } : undefined,
      oficial: oficialData ? { compra: oficialData.compra, venta: oficialData.venta, fechaActualizacion: oficialData.fechaActualizacion } : undefined,
    };
  } catch (error) {
    console.error('Error fetching dolar rates:', error);
    // Fallback realistic rates
    return {
      blue: { compra: 1380, venta: 1400, fechaActualizacion: new Date().toISOString() },
      oficial: { compra: 950, venta: 990, fechaActualizacion: new Date().toISOString() },
    };
  }
}
