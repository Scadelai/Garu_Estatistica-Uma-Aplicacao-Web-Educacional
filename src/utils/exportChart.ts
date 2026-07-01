import { toPng } from 'html-to-image';

export const exportChartAsPNG = async (chartRef: React.RefObject<HTMLDivElement | null>, filename: string) => {
  if (!chartRef.current) {
    console.error('No chart reference found');
    return;
  }

  try {
    // Convert the DOM node to PNG
    const dataUrl = await toPng(chartRef.current, { 
      backgroundColor: '#ffffff',
      pixelRatio: 2 // High-res export
    });

    // Trigger download
    const downloadLink = document.createElement('a');
    downloadLink.download = `${filename}.png`;
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

  } catch (error) {
    console.error('Error exporting chart to PNG:', error);
    alert('Ocorreu um erro ao exportar o gráfico. Tente novamente.');
  }
};
