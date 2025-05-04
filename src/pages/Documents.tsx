
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { DocumentStatus, Document } from '@/types';
import { FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

// Mock documents data
const mockDocuments: Document[] = [
  {
    id: '1',
    userId: '101',
    type: 'passport',
    fileName: 'passport_john_doe.pdf',
    uploadDate: '2025-05-01T10:30:00Z',
    status: 'pending',
    extractedData: {
      name: 'John Doe',
      dob: '1985-06-15',
      idNumber: 'P12345678',
      nationality: 'Sweden',
      expiryDate: '2030-06-14',
    },
  },
  {
    id: '2',
    userId: '102',
    type: 'id',
    fileName: 'national_id_anna.jpg',
    uploadDate: '2025-05-02T09:15:00Z',
    status: 'verified',
    verifiedBy: '1',
    verificationDate: '2025-05-02T14:20:00Z',
    extractedData: {
      name: 'Anna Johansson',
      dob: '1990-03-22',
      idNumber: '900322-1234',
      nationality: 'Sweden',
    },
  },
  {
    id: '3',
    userId: '103',
    type: 'license',
    fileName: 'drivers_license_mikhail.png',
    uploadDate: '2025-05-03T11:45:00Z',
    status: 'rejected',
    verifiedBy: '1',
    verificationDate: '2025-05-03T16:30:00Z',
  },
  {
    id: '4',
    userId: '104',
    type: 'passport',
    fileName: 'passport_sarah.pdf',
    uploadDate: '2025-05-03T13:10:00Z',
    status: 'pending',
  },
  {
    id: '5',
    userId: '105',
    type: 'id',
    fileName: 'national_id_erik.jpg',
    uploadDate: '2025-05-04T08:20:00Z',
    status: 'pending',
  },
];

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'all'>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'passport' | 'id' | 'license'>('passport');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newDocument: Document = {
        id: `${documents.length + 1}`,
        userId: '107', // Mock user ID
        type: documentType,
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        status: 'pending',
      };

      setDocuments([newDocument, ...documents]);
      setSelectedFile(null);
      setUploading(false);

      toast({
        title: 'Document uploaded successfully',
        description: 'Your document has been uploaded and is pending review.',
      });
    }, 1500);
  };

  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.status === activeTab);

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'support']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Upload and manage KYC documents
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload a new document for KYC verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <select
                    id="documentType"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as any)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="passport">Passport</option>
                    <option value="id">National ID</option>
                    <option value="license">Driver's License</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document">Upload File</Label>
                  <div className="grid w-full items-center gap-1.5">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="document"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-6 w-6 mb-2 text-regulynx-blue" />
                          <p className="mb-2 text-sm text-center">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG or PDF (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          id="document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {selectedFile && (
                      <div className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Document List</CardTitle>
              <CardDescription>
                View and manage uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as DocumentStatus | 'all')}
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>

                <div className="mt-6 space-y-4">
                  {filteredDocuments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="font-medium text-lg">No documents found</h3>
                      <p className="text-muted-foreground text-sm">
                        {activeTab === 'all' 
                          ? "No documents have been uploaded yet"
                          : `No ${activeTab} documents found`
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-3 bg-muted/50 text-xs font-medium">
                        <div>Document</div>
                        <div>Type</div>
                        <div>Upload Date</div>
                        <div className="text-right">Status</div>
                      </div>
                      <div className="divide-y">
                        {filteredDocuments.map((doc) => (
                          <div key={doc.id} className="grid grid-cols-4 p-3 items-center">
                            <div className="font-medium truncate">{doc.fileName}</div>
                            <div className="capitalize">{doc.type}</div>
                            <div>
                              {new Date(doc.uploadDate).toLocaleDateString('en-SE', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                                doc.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : doc.status === 'verified' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {getStatusIcon(doc.status)} {doc.status}
                              </span>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Document Verification</CardTitle>
            <CardDescription>
              Review and verify pending documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents
                .filter(doc => doc.status === 'pending')
                .slice(0, 2)
                .map((doc) => (
                  <div 
                    key={doc.id} 
                    className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="space-y-2">
                      <div className="font-medium">{doc.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Type: <span className="capitalize">{doc.type}</span></div>
                        <div>
                          Uploaded: {new Date(doc.uploadDate).toLocaleDateString('en-SE')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-medium">Extracted Data</div>
                      {doc.extractedData ? (
                        <div className="text-sm">
                          {doc.extractedData.name && (
                            <div>Name: {doc.extractedData.name}</div>
                          )}
                          {doc.extractedData.dob && (
                            <div>DOB: {doc.extractedData.dob}</div>
                          )}
                          {doc.extractedData.idNumber && (
                            <div>ID: {doc.extractedData.idNumber}</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No data extracted
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col md:items-end justify-center gap-2">
                      <Button>Verify Document</Button>
                      <Button variant="outline">Reject</Button>
                    </div>
                  </div>
                ))}
              
              {documents.filter(doc => doc.status === 'pending').length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
                  <h3 className="font-medium text-lg">All caught up!</h3>
                  <p className="text-muted-foreground text-sm">
                    There are no documents pending verification
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Documents;
