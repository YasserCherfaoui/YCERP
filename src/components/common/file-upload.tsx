import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    Check,
    Eye,
    File,
    FileImage,
    FileText,
    Loader2,
    Upload,
    X
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

export interface FileUploadProps {
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Whether multiple files are allowed */
  multiple?: boolean;
  /** Upload handler */
  onUpload?: (files: File[]) => Promise<void>;
  /** File change handler */
  onChange?: (files: File[]) => void;
  /** File remove handler */
  onRemove?: (index: number) => void;
  /** Current files */
  value?: File[] | FileInfo[];
  /** Upload variant */
  variant?: 'default' | 'dropzone' | 'button' | 'compact';
  /** Additional CSS classes */
  className?: string;
  /** Whether upload is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Show file preview */
  showPreview?: boolean;
  /** Show upload progress */
  showProgress?: boolean;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Whether upload is in progress */
  uploading?: boolean;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
}

export interface FileInfo {
  /** File object */
  file?: File;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** File type */
  type: string;
  /** File URL (for existing files) */
  url?: string;
  /** Upload status */
  status?: 'pending' | 'uploading' | 'success' | 'error';
  /** Upload progress */
  progress?: number;
  /** Error message */
  error?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FileImage;
  if (type.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isValidFileType = (file: File, accept?: string): boolean => {
  if (!accept) return true;
  
  const acceptedTypes = accept.split(',').map(type => type.trim());
  
  return acceptedTypes.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
    }
    if (acceptedType.includes('*')) {
      const baseType = acceptedType.split('/')[0];
      return file.type.startsWith(baseType);
    }
    return file.type === acceptedType;
  });
};

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
  multiple = false,
  onUpload,
  onChange,
  onRemove,
  value = [],
  variant = 'default',
  className,
  disabled = false,
  placeholder,
  showPreview = true,
  showProgress = true,
  uploadProgress = 0,
  uploading = false,
  error,
  success,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>(
    value.map(file => 
      file instanceof File 
        ? { file, name: file.name, size: file.size, type: file.type, status: 'pending' }
        : file
    )
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || disabled) return;

    const newFiles: FileInfo[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach(file => {
      // Check file type
      if (!isValidFileType(file, accept)) {
        errors.push(`${file.name}: Invalid file type`);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File too large (max ${formatFileSize(maxSize)})`);
        return;
      }

      // Check max files limit
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
        return;
      }

      newFiles.push({
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
      });
    });

    if (errors.length > 0) {
      toast({
        title: 'Upload Error',
        description: errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    
    const fileObjects = updatedFiles.map(f => f.file!).filter(Boolean);
    onChange?.(fileObjects);
  }, [files, accept, maxSize, maxFiles, multiple, disabled, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleRemove = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    const fileObjects = updatedFiles.map(f => f.file!).filter(Boolean);
    onChange?.(fileObjects);
    onRemove?.(index);
  }, [files, onChange, onRemove]);

  const handleUpload = useCallback(async () => {
    if (!onUpload || files.length === 0) return;

    const fileObjects = files.map(f => f.file!).filter(Boolean);
    
    try {
      await onUpload(fileObjects);
      
      // Update file statuses to success
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const })));
      
      toast({
        title: 'Upload Successful',
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      // Update file statuses to error
      setFiles(prev => prev.map(f => ({ 
        ...f, 
        status: 'error' as const, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      })));
      
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload.',
        variant: 'destructive',
      });
    }
  }, [onUpload, files]);

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const FilePreview: React.FC<{ file: FileInfo; index: number }> = ({ file, index }) => {
    const Icon = getFileIcon(file.type);
    
    return (
      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
        <Icon className="h-8 w-8 text-muted-foreground" />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {file.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
          
          {file.status === 'uploading' && file.progress !== undefined && (
            <Progress value={file.progress} className="mt-1 h-1" />
          )}
          
          {file.error && (
            <p className="text-xs text-red-600 mt-1">{file.error}</p>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {file.status === 'success' && (
            <Check className="h-4 w-4 text-green-600" />
          )}
          {file.status === 'error' && (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          {file.status === 'uploading' && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          )}
          
          {file.url && (
            <Button size="sm" variant="ghost" asChild>
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Eye className="h-3 w-3" />
              </a>
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => handleRemove(index)}
            disabled={disabled || file.status === 'uploading'}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const DropzoneContent = () => (
    <div
      className={cn(
        'border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors',
        isDragOver && 'border-primary bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer hover:border-primary/50'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={openFileDialog}
    >
      <Upload className={cn(
        'mx-auto h-12 w-12 text-muted-foreground',
        isDragOver && 'text-primary'
      )} />
      
      <div className="mt-4">
        <p className="text-lg font-medium text-foreground">
          {placeholder || 'Drop files here or click to upload'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {accept && `Accepts: ${accept}`}
          {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
          {multiple && ` • Max files: ${maxFiles}`}
        </p>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 text-sm text-green-600 bg-green-50 p-2 rounded">
          {success}
        </div>
      )}
    </div>
  );

  if (variant === 'button') {
    return (
      <div className={cn('space-y-4', className)}>
        <Button
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          {placeholder || 'Upload Files'}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        {files.length > 0 && showPreview && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <FilePreview key={index} file={file} index={index} />
            ))}
          </div>
        )}
        
        {files.length > 0 && onUpload && (
          <Button onClick={handleUpload} disabled={uploading || disabled}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length} File(s)
              </>
            )}
          </Button>
        )}
        
        {uploading && showProgress && (
          <Progress value={uploadProgress} className="mt-2" />
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={openFileDialog}
            disabled={disabled}
          >
            <Upload className="mr-1 h-3 w-3" />
            Upload
          </Button>
          
          {files.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {files.length} file(s) selected
            </span>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        {files.length > 0 && showPreview && (
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded">
                <span className="truncate">{file.name}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleRemove(index)}
                  className="h-4 w-4 p-0"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default and dropzone variants
  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      
      <DropzoneContent />
      
      {files.length > 0 && showPreview && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Selected Files ({files.length})
          </Label>
          <div className="space-y-2">
            {files.map((file, index) => (
              <FilePreview key={index} file={file} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {files.length > 0 && onUpload && (
        <div className="flex items-center space-x-2">
          <Button onClick={handleUpload} disabled={uploading || disabled}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {files.length} File(s)
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setFiles([])}
            disabled={uploading || disabled}
          >
            Clear All
          </Button>
        </div>
      )}
      
      {uploading && showProgress && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;