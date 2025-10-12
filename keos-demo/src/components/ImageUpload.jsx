import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Trash2, Eye } from 'lucide-react';

const ImageUpload = ({ images, onImagesChange, maxImages = 5, label = "Bilder hochladen" }) => {
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert('Bitte wählen Sie nur gültige Bilddateien (max. 5MB) aus.');
      return;
    }

    if (images.length + validFiles.length > maxImages) {
      alert(`Maximal ${maxImages} Bilder erlaubt.`);
      return;
    }

    setUploading(true);
    const newImages = [];

    for (const file of validFiles) {
      try {
        // Create preview
        const previewUrl = URL.createObjectURL(file);
        const previewImage = {
          id: Date.now() + Math.random(),
          file,
          preview: previewUrl,
          name: file.name,
          size: file.size
        };
        
        newImages.push(previewImage);
        setPreviewImages(prev => [...prev, previewImage]);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }

    onImagesChange([...images, ...newImages]);
    setUploading(false);
  };

  const removeImage = (imageId) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const updatedImages = images.filter(img => img.id !== imageId);
    const updatedPreviews = previewImages.filter(img => img.id !== imageId);
    
    onImagesChange(updatedImages);
    setPreviewImages(updatedPreviews);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-700">
        {label} ({images.length}/{maxImages})
      </label>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-[#15505d] hover:bg-slate-50 ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center">
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15505d] mb-2"></div>
          ) : (
            <Upload className="h-8 w-8 text-slate-400 mb-2" />
          )}
          <p className="text-sm text-slate-600">
            {uploading ? 'Lade hoch...' : 'Klicken Sie hier oder ziehen Sie Bilder hierher'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            PNG, JPG, GIF bis zu 5MB pro Bild
          </p>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                <img
                  src={image.preview || image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs">
                <p className="truncate">{image.name}</p>
                <p>{formatFileSize(image.size)}</p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => window.open(image.preview || image.url, '_blank')}
                  className="p-1 bg-white bg-opacity-90 rounded hover:bg-opacity-100 transition-colors"
                  title="Vollbild anzeigen"
                >
                  <Eye className="h-3 w-3 text-slate-700" />
                </button>
                <button
                  onClick={() => removeImage(image.id)}
                  className="p-1 bg-red-500 bg-opacity-90 rounded hover:bg-opacity-100 transition-colors"
                  title="Bild entfernen"
                >
                  <Trash2 className="h-3 w-3 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500">
        <p>• Vorher-Bilder: Zeigen Sie den Zustand vor der Arbeit</p>
        <p>• Nachher-Bilder: Zeigen Sie das Ergebnis nach der Arbeit</p>
        <p>• Bilder helfen bei der Dokumentation und Qualitätskontrolle</p>
      </div>
    </div>
  );
};

export default ImageUpload;
