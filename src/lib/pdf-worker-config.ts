/**
 * Configuration globale du PDF Worker pour react-pdf
 * Configuration force-local pour éviter les erreurs CDN
 * Le worker est servi depuis le dossier public/
 */
import { pdfjs } from 'react-pdf';
// Import nécessaire pour Vite
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuration force-local pour éviter les erreurs CDN
// Le worker doit être copié dans public/pdf.worker.min.js
// Pour le copier : cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.js public/
if (typeof window !== 'undefined') {
  // Servir le worker depuis le dossier public (statique)
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  console.log(`[PDF Worker] Configuré localement avec pdfjs-dist@${pdfjs.version} depuis /public`);
}

export { pdfjs };
