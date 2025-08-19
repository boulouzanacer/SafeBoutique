import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
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
    const uppyInstance = new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['image/*'],
      },
      autoProceed: false,
    });

    // Wrap all handlers in try-catch to prevent crashes
    const safeGetUploadParameters = async (file: any) => {
      try {
        console.log("Getting upload parameters for file:", file?.name);
        const params = await onGetUploadParameters(file);
        console.log("Upload parameters received:", params);
        return {
          method: params.method,
          url: params.url,
          fields: {},
          headers: {}
        };
      } catch (error) {
        console.error("Upload parameters error:", error);
        throw error;
      }
    };

    const safeCompleteHandler = (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
      try {
        console.log("Upload complete:", result);
        if (onComplete) {
          onComplete(result);
        }
        setShowModal(false);
      } catch (error) {
        console.error("Error in complete handler:", error);
      }
    };

    const safeErrorHandler = (error: any) => {
      console.error("Uppy error:", error);
    };

    const safeUploadErrorHandler = (file: any, error: any) => {
      console.error("Upload error for file:", file?.name, "Error:", error);
    };

    // Configure the uppy instance
    uppyInstance
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: safeGetUploadParameters,
      })
      .on("complete", safeCompleteHandler)
      .on("upload-error", safeUploadErrorHandler)
      .on("error", safeErrorHandler);

    setUppy(uppyInstance);

    // Cleanup function
    return () => {
      if (uppyInstance) {
        uppyInstance.close();
      }
    };
  }, [maxNumberOfFiles, maxFileSize, onGetUploadParameters, onComplete]);

  if (!uppy) {
    return (
      <Button disabled className={buttonClassName}>
        Loading...
      </Button>
    );
  }

  return (
    <div>
      <Button 
        onClick={() => {
          try {
            setShowModal(true);
          } catch (error) {
            console.error("Error opening modal:", error);
          }
        }} 
        className={buttonClassName}
      >
        {children}
      </Button>

      {showModal && (
        <DashboardModal
          uppy={uppy}
          open={showModal}
          onRequestClose={() => {
            try {
              setShowModal(false);
            } catch (error) {
              console.error("Error closing modal:", error);
            }
          }}
          proudlyDisplayPoweredByUppy={false}
        />
      )}
    </div>
  );
}