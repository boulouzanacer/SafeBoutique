import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file: any) => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * The component uses Uppy under the hood to handle all file upload functionality.
 * All file management features are automatically handled by the Uppy dashboard modal.
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded
 *   (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL).
 *   Typically used to fetch a presigned URL from the backend server for direct-to-S3
 *   uploads.
 * @param props.onComplete - Callback function called when upload is complete. Typically
 *   used to make post-upload API calls to update server state and set object ACL
 *   policies.
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy, setUppy] = useState<Uppy | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const createUppyInstance = () => {
      const uppyInstance = new Uppy({
        restrictions: {
          maxNumberOfFiles,
          maxFileSize,
          allowedFileTypes: ['image/*'],
        },
        autoProceed: false,
      });

      // Direct upload handler without AWS S3 plugin
      const handleUpload = async (uploadID: string, files: any[]) => {
        const uploadedFiles: any[] = [];
        const failedFiles: any[] = [];
        
        try {
          for (const file of files) {
            console.log("Uploading file:", file?.name);
            
            try {
              // Create FormData for multipart upload
              const formData = new FormData();
              formData.append('file', file.data);
              
              // Get auth token from localStorage
              const token = localStorage.getItem('authToken');
              
              // Upload file directly to our endpoint
              const response = await fetch('/api/objects/upload', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                },
                body: formData
              });
              
              if (!response.ok) {
                const error = await response.json();
                failedFiles.push(file);
                uppyInstance.emit('upload-error', file, new Error(error.error || 'Upload failed'));
                continue;
              }
              
              const data = await response.json();
              console.log("Upload successful, received URL:", data.uploadURL);
              
              // Update file with uploadURL
              uppyInstance.setFileState(file.id, {
                uploadURL: data.uploadURL
              });
              
              // Add to successful uploads with uploadURL
              const fileWithURL = { ...file, uploadURL: data.uploadURL };
              uploadedFiles.push(fileWithURL);
              
              // Mark as complete
              uppyInstance.emit('upload-success', file, { 
                status: 200,
                uploadURL: data.uploadURL 
              });
            } catch (fileError) {
              console.error("File upload error:", fileError);
              failedFiles.push(file);
            }
          }
          
          // Manually trigger complete event with proper result
          const result = {
            successful: uploadedFiles,
            failed: failedFiles,
            uploadID: uploadID
          };
          
          console.log("Manual complete trigger with result:", result);
          uppyInstance.emit('complete', result);
          
        } catch (error) {
          console.error("Upload error:", error);
        }
      };

      // Safe wrapper for completion handler
      const handleComplete = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
        try {
          console.log("Upload complete:", result);
          
          if (onComplete && mounted) {
            onComplete(result);
          }
          if (mounted) {
            setShowModal(false);
          }
        } catch (error) {
          console.error("Error in complete handler:", error);
        }
      };

      // Safe error handlers
      const handleError = (error: any) => {
        console.error("Uppy error:", error);
      };

      const handleUploadError = (file: any, error: any) => {
        console.error("Upload error for file:", file?.name, "Error:", error);
      };

      // Configure uppy
      uppyInstance
        .on("upload", handleUpload)
        .on("complete", handleComplete)
        .on("upload-error", handleUploadError)
        .on("error", handleError);

      return uppyInstance;
    };

    const uppyInstance = createUppyInstance();
    
    if (mounted) {
      setUppy(uppyInstance);
    }

    // Cleanup function
    return () => {
      mounted = false;
      if (uppyInstance) {
        try {
          // Use proper Uppy cleanup methods
          uppyInstance.cancelAll();
          if (typeof uppyInstance.destroy === 'function') {
            uppyInstance.destroy();
          }
        } catch (error) {
          console.error("Error cleaning up Uppy instance:", error);
        }
      }
    };
  }, [maxNumberOfFiles, maxFileSize, onGetUploadParameters, onComplete]);

  const handleOpenModal = () => {
    try {
      setShowModal(true);
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  };

  const handleCloseModal = () => {
    try {
      setShowModal(false);
    } catch (error) {
      console.error("Error closing modal:", error);
    }
  };

  if (!uppy) {
    return (
      <Button type="button" disabled className={buttonClassName}>
        Loading...
      </Button>
    );
  }

  return (
    <div>
      <Button type="button" onClick={handleOpenModal} className={buttonClassName}>
        {children}
      </Button>

      {showModal && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={handleCloseModal}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </div>
  );
}