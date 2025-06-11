import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Image, Link, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogoUploadProps {
  logoUrl: string;
  onLogoChange: (url: string) => void;
  companyName: string;
}

export function LogoUpload({ logoUrl, onLogoChange, companyName }: LogoUploadProps) {
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [tempUrl, setTempUrl] = useState(logoUrl);
  const [previewUrl, setPreviewUrl] = useState(logoUrl);
  const { toast } = useToast();

  const handleUrlSubmit = () => {
    if (!tempUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid logo URL",
        variant: "destructive"
      });
      return;
    }

    // Test if URL is valid image
    const img = new Image();
    img.onload = () => {
      onLogoChange(tempUrl);
      setPreviewUrl(tempUrl);
      toast({
        title: "Logo Updated",
        description: "Company logo has been successfully updated",
      });
    };
    img.onerror = () => {
      toast({
        title: "Invalid Image URL",
        description: "The URL does not point to a valid image",
        variant: "destructive"
      });
    };
    img.src = tempUrl;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onLogoChange(dataUrl);
      setPreviewUrl(dataUrl);
      setTempUrl(dataUrl);
      toast({
        title: "Logo Uploaded",
        description: "Company logo has been successfully uploaded",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onLogoChange("");
    setPreviewUrl("");
    setTempUrl("");
    toast({
      title: "Logo Removed",
      description: "Company logo has been removed",
    });
  };

  const handlePreview = () => {
    if (tempUrl && tempUrl !== previewUrl) {
      const img = new Image();
      img.onload = () => setPreviewUrl(tempUrl);
      img.onerror = () => {
        toast({
          title: "Invalid Image URL",
          description: "Cannot preview this image URL",
          variant: "destructive"
        });
      };
      img.src = tempUrl;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Company Logo Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Logo Preview */}
        {previewUrl && (
          <div className="text-center space-y-2">
            <Label>Current Logo</Label>
            <div className="flex justify-center">
              <div className="relative inline-block p-4 border border-gray-200 rounded-lg bg-white">
                <img
                  src={previewUrl}
                  alt={`${companyName} Logo`}
                  className="max-h-24 max-w-48 object-contain"
                  onError={() => {
                    setPreviewUrl("");
                    toast({
                      title: "Logo Load Error",
                      description: "Failed to load the logo image",
                      variant: "destructive"
                    });
                  }}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveLogo}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove Logo
            </Button>
          </div>
        )}

        {/* Upload Method Selection */}
        <div className="flex gap-2">
          <Button
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('url')}
          >
            <Link className="h-4 w-4 mr-2" />
            URL
          </Button>
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('file')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* URL Input */}
        {uploadMethod === 'url' && (
          <div className="space-y-3">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <div className="flex gap-2">
              <Input
                id="logoUrl"
                type="url"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={!tempUrl || tempUrl === previewUrl}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleUrlSubmit}
                disabled={!tempUrl || tempUrl === logoUrl}
              >
                Apply
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Enter the URL of your company logo image. Supported formats: PNG, JPG, GIF, SVG
            </div>
          </div>
        )}

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div className="space-y-3">
            <Label htmlFor="logoFile">Upload Logo File</Label>
            <Input
              id="logoFile"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
            <div className="text-xs text-gray-500">
              Upload your company logo. Maximum file size: 5MB. Supported formats: PNG, JPG, GIF, SVG
            </div>
          </div>
        )}

        {/* Logo Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-blue-900">Logo Guidelines</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>• Recommended dimensions: 200x100 pixels or similar aspect ratio</div>
            <div>• Use transparent background (PNG) for best results</div>
            <div>• Ensure logo is readable on both light and dark backgrounds</div>
            <div>• Keep file size under 1MB for optimal loading performance</div>
          </div>
        </div>

        {/* Branding Impact Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 shrink-0">
              Note
            </Badge>
            <div className="text-sm text-yellow-800">
              Changes to your company logo will be visible across all client portals, 
              login pages, and public-facing interfaces immediately after saving.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}