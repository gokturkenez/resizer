const { useState, useRef } = React;

// Lucide React icons as components
const Download = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const Upload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileImage = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

function LogoResizer() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const sizes = [
    { width: 500, height: 378, name: '500x378', formats: ['png'] },
    { width: 265, height: 46, name: '265x46', formats: ['png'] },
    { width: 398, height: 161, name: '398x161', formats: ['png'] },
    { width: 100, height: 50, name: '100x50', formats: ['png'] },
    { width: 200, height: 90, name: '200x90', formats: ['png', 'jpg'] },
    { width: 1920, height: 1110, name: '1920x1110', formats: ['jpg'] }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const resizeImage = (img, targetWidth, targetHeight, format) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    
    const imgAspect = img.width / img.height;
    const targetAspect = targetWidth / targetHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > targetAspect) {
      drawWidth = targetWidth;
      drawHeight = targetWidth / imgAspect;
      offsetX = 0;
      offsetY = (targetHeight - drawHeight) / 2;
    } else {
      drawHeight = targetHeight;
      drawWidth = targetHeight * imgAspect;
      offsetX = (targetWidth - drawWidth) / 2;
      offsetY = 0;
    }
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    if (format === 'jpg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95);
    });
  };

  const downloadImage = async (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (!uploadedImage) return;
    
    setProcessing(true);
    
    for (const size of sizes) {
      for (const format of size.formats) {
        const blob = await resizeImage(uploadedImage, size.width, size.height, format);
        await downloadImage(blob, `logo-${size.name}.${format}`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    setProcessing(false);
  };

  const handleDownloadSingle = async (size, format) => {
    if (!uploadedImage) return;
    
    const blob = await resizeImage(uploadedImage, size.width, size.height, format);
    await downloadImage(blob, `logo-${size.name}.${format}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Logo Resizer</h1>
            <p className="text-gray-600">Upload your logo and download all required sizes</p>
            <p className="text-sm text-orange-600 mt-2">✓ Maintains aspect ratio - no squeezing!</p>
          </div>

          <div className="mb-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-orange-300 rounded-xl p-12 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {uploadedImage ? (
                <div className="flex flex-col items-center">
                  <FileImage className="w-16 h-16 text-green-500 mb-4" />
                  <p className="text-green-600 font-semibold">Image uploaded successfully!</p>
                  <p className="text-sm text-gray-500 mt-2">Original size: {uploadedImage.width} × {uploadedImage.height}</p>
                  <p className="text-xs text-gray-400 mt-1">Click to upload a different image</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-16 h-16 text-orange-400 mb-4" />
                  <p className="text-gray-600 font-semibold">Click to upload your logo</p>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, or SVG</p>
                </div>
              )}
            </div>
          </div>

          {uploadedImage && (
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
              <div className="flex justify-center bg-white p-4 rounded-lg border-2 border-gray-200">
                <img 
                  src={uploadedImage.src} 
                  alt="Uploaded logo" 
                  className="max-h-48 object-contain"
                />
              </div>
            </div>
          )}

          {uploadedImage && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Download Options</h3>
                <button
                  onClick={handleDownloadAll}
                  disabled={processing}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md"
                >
                  <Download className="w-5 h-5" />
                  {processing ? 'Processing...' : 'Download All'}
                </button>
              </div>

              <div className="grid gap-4">
                {sizes.map((size, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{size.name}</p>
                        <p className="text-sm text-gray-500">{size.width} × {size.height} pixels (aspect ratio preserved)</p>
                      </div>
                      <div className="flex gap-2">
                        {size.formats.map((format) => (
                          <button
                            key={format}
                            onClick={() => handleDownloadSingle(size, format)}
                            className="bg-white hover:bg-orange-100 border-2 border-gray-200 hover:border-orange-400 text-gray-700 hover:text-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            {format.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<LogoResizer />, document.getElementById('root'));
