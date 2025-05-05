
import React, { useState } from 'react';

interface PDFViewerProps {
  file: File | null;
}

const PDFViewer = ({ file }: PDFViewerProps) => {
  const [url, setUrl] = useState<string | null>(null);
  
  React.useEffect(() => {
    // Clean up previous URL object to avoid memory leaks
    if (url) {
      URL.revokeObjectURL(url);
    }
    
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setUrl(fileUrl);
      
      // Clean up when component unmounts
      return () => {
        URL.revokeObjectURL(fileUrl);
      };
    }
  }, [file]);
  
  if (!file || !url) {
    return null;
  }
  
  return (
    <div className="w-full h-full border border-gray-200 rounded-md overflow-hidden">
      <object
        data={url}
        type="application/pdf"
        className="w-full h-full"
      >
        <p>Your browser does not support PDFs. <a href={url} download={file.name}>Download the PDF</a> instead.</p>
      </object>
    </div>
  );
};

export default PDFViewer;
