import { useState, ChangeEvent, FormEvent } from 'react';

const UploadLogoForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadStatus(''); // Clear status on new file selection
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', selectedFile);

    setIsUploading(true); // Set uploading state to true

    try {
      const res = await fetch('/api/upload_logo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadStatus('Logo uploaded successfully.');
        setSelectedFile(null); // Reset the selected file
      } else {
        const errorData = await res.json();
        setUploadStatus(`Failed to upload logo. ${errorData?.error || ''}`);
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      setUploadStatus('Error uploading logo. Please try again.');
    } finally {
      setIsUploading(false); // Reset uploading state
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading} // Disable input during upload
        />
        <button type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Logo'}
        </button>
      </form>
      {selectedFile && (
        <p>
          <strong>Selected file:</strong> {selectedFile.name}
        </p>
      )}
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default UploadLogoForm;
