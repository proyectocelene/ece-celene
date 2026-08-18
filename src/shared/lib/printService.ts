/**
 * Servicio de Impresión Médica Aislada de Alta Fidelidad
 * Diseñado específicamente para hoja tamaño carta (Letter: 8.5 x 11 in)
 * con márgenes delgados optimizados y soporte multi-página impecable.
 */
export class PrintService {
  static printElement(elementId: string, options?: { landscape?: boolean; title?: string }): void {
    const sourceElement = document.getElementById(elementId);
    if (!sourceElement) {
      console.warn(`[PrintService] Elemento con id '${elementId}' no encontrado.`);
      window.print();
      return;
    }

    const htmlContent = sourceElement.outerHTML;
    this.printHtml(htmlContent, options);
  }

  static printHtml(bodyHtml: string, options?: { landscape?: boolean; title?: string }): void {
    const isLandscape = options?.landscape || false;
    const documentTitle = options?.title || 'Impresión Médica - Proyecto Celene';

    // Recolectar todos los estilos de la aplicación principal (Tailwind / Fonts)
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    // Crear iframe invisible
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    iframe.id = `print-frame-${Date.now()}`;

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${documentTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">
        ${styleTags}
        <style>
          @page {
            size: ${isLandscape ? 'letter landscape' : 'letter portrait'};
            margin: ${isLandscape ? '6mm 8mm' : '8mm 10mm'};
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html {
            font-size: 14px !important;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #1e293b !important;
            font-family: 'Archivo', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            line-height: 1.4;
            width: 100% !important;
            -webkit-font-smoothing: antialiased;
          }
          .no-print {
            display: none !important;
          }
          /* Control estricto de quiebres de página para recetas largas */
          .page-break-inside-avoid,
          .rx-item,
          .signature-box,
          .vitals-box,
          .patient-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 100%; margin: 0; padding: 0;">
          ${bodyHtml}
        </div>
      </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error('[PrintService] Error al invocar print:', err);
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 2500);
        }
      }, 350);
    };

    if (iframe.contentWindow?.document.readyState === 'complete') {
      triggerPrint();
    } else {
      iframe.onload = triggerPrint;
    }
  }
}
