import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCw, RotateCcw, RefreshCw, Check, X, Loader2, Crop } from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onConfirm: (croppedBlob: Blob, croppedDataUrl: string) => Promise<void>;
  isUploading?: boolean;
}

const VIEWPORT_SIZE = 320; // Canvas display dimension (square)
const CROP_DIAMETER = 240; // Diameter of circular avatar preview
const OUTPUT_SIZE = 500;   // High-res output size for avatar (500x500)

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onConfirm,
  isUploading = false,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      setImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
      // Auto fit initial zoom
      const minDimension = Math.min(img.naturalWidth, img.naturalHeight);
      const initialScale = CROP_DIAMETER / minDimension;
      setZoom(Math.max(initialScale, 1));
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw viewport with image and circular overlay
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

    // Save context state
    ctx.save();

    // Move to viewport center
    const centerX = VIEWPORT_SIZE / 2;
    const centerY = VIEWPORT_SIZE / 2;
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const imgW = image.naturalWidth;
    const imgH = image.naturalHeight;
    ctx.drawImage(image, -imgW / 2, -imgH / 2, imgW, imgH);

    ctx.restore();

    // Draw dark overlay outside the circle
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)'; // slate-900 with opacity
    ctx.beginPath();
    ctx.rect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);
    // Cut out circular viewport
    ctx.arc(centerX, centerY, CROP_DIAMETER / 2, 0, Math.PI * 2, true);
    ctx.fill();

    // Draw circular guideline ring
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, CROP_DIAMETER / 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }, [image, zoom, rotation, pan]);

  // Update live thumbnail preview
  const generateCropped = useCallback((): Promise<{ blob: Blob; dataUrl: string } | null> => {
    return new Promise((resolve) => {
      if (!image) {
        resolve(null);
        return;
      }
      const offscreen = document.createElement('canvas');
      offscreen.width = OUTPUT_SIZE;
      offscreen.height = OUTPUT_SIZE;
      const oCtx = offscreen.getContext('2d');
      if (!oCtx) {
        resolve(null);
        return;
      }

      // High quality smoothing
      oCtx.imageSmoothingEnabled = true;
      oCtx.imageSmoothingQuality = 'high';

      // Clip circular avatar
      oCtx.beginPath();
      oCtx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      oCtx.clip();

      const scaleRatio = OUTPUT_SIZE / CROP_DIAMETER;
      oCtx.save();
      oCtx.translate(OUTPUT_SIZE / 2 + pan.x * scaleRatio, OUTPUT_SIZE / 2 + pan.y * scaleRatio);
      oCtx.rotate((rotation * Math.PI) / 180);
      oCtx.scale(zoom * scaleRatio, zoom * scaleRatio);

      const imgW = image.naturalWidth;
      const imgH = image.naturalHeight;
      oCtx.drawImage(image, -imgW / 2, -imgH / 2, imgW, imgH);
      oCtx.restore();

      const dataUrl = offscreen.toDataURL('image/png', 0.95);
      offscreen.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, dataUrl });
          } else {
            resolve(null);
          }
        },
        'image/png',
        0.95
      );
    });
  }, [image, zoom, rotation, pan]);

  // Re-draw when dependencies change
  useEffect(() => {
    if (isOpen && image) {
      drawCanvas();
      // Update preview thumbnail debounced
      const timer = setTimeout(async () => {
        const result = await generateCropped();
        if (result) setLivePreviewUrl(result.dataUrl);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, image, drawCanvas, generateCropped]);

  // Pan handlers (mouse & touch)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 4));
  };

  const handleReset = () => {
    if (image) {
      const minDimension = Math.min(image.naturalWidth, image.naturalHeight);
      const initialScale = CROP_DIAMETER / minDimension;
      setZoom(Math.max(initialScale, 1));
    } else {
      setZoom(1);
    }
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleConfirm = async () => {
    const result = await generateCropped();
    if (result) {
      await onConfirm(result.blob, result.dataUrl);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-gray-100 shadow-2xl space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Crop size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Xem trước & Căn chỉnh ảnh</h3>
              <p className="text-xs text-gray-500">Kéo để di chuyển, dùng thanh trượt hoặc cuộn chuột để phóng to/thu nhỏ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas Workspace & Preview */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Interactive Crop Viewport */}
          <div className="relative group rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-inner bg-slate-900 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={VIEWPORT_SIZE}
              height={VIEWPORT_SIZE}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className={`cursor-${isDragging ? 'grabbing' : 'grab'} select-none touch-none`}
            />
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[10px] rounded-md pointer-events-none backdrop-blur-xs">
              Kéo để chỉnh vị trí
            </div>
          </div>

          {/* Live circular preview thumbnail */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-semibold text-gray-500">Xem trước hiển thị</div>
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {livePreviewUrl ? (
                <img src={livePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400">Loading...</span>
              )}
            </div>
            <span className="text-[11px] text-gray-400">Khung tròn Avatar</span>
          </div>
        </div>

        {/* Adjustment Controls */}
        <div className="space-y-4 pt-1">
          {/* Zoom Control Slider */}
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
            <ZoomOut size={16} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              disabled={isUploading}
              className="flex-1 accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
            />
            <ZoomIn size={16} className="text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-600 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Tools: Rotate & Reset */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw size={13} />
                <span>Xoay trái</span>
              </button>
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCw size={13} />
                <span>Xoay phải</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang upload lên Cloudinary...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Lưu & Tải lên</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
