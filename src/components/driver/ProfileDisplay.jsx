import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, User, Phone, Globe, FileText, Edit2, ShieldAlert, ShieldCheck, Mail } from 'lucide-react';
import DocumentUpload from './DocumentUpload';

const ProfileDisplay = ({ driver, onEditClick, onRefresh }) => {
  const isVerified = driver.verification_status === 'approved';
  
  // Checklist calculation
  const checklist = [
    { label: 'First Name', completed: !!driver.first_name },
    { label: 'Last Name', completed: !!driver.last_name },
    { label: 'Phone', completed: !!driver.phone },
    { label: 'Languages', completed: driver.languages_spoken?.length > 0 },
    { label: 'Documents', completed: !!driver.id_document_url && !!driver.license_document_url }
  ];
  
  const completedCount = checklist.filter(i => i.completed).length;
  const isComplete = completedCount === checklist.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Card */}
        <Card className="p-6 border-none shadow-sm bg-gradient-to-r from-gray-900 to-gray-800 text-white overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden shrink-0 bg-gray-700">
                    {driver.avatar_url ? (
                        <img src={driver.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-400" />
                        </div>
                    )}
                </div>
                
                <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <h2 className="text-2xl font-bold">
                            {driver.first_name} {driver.last_name}
                        </h2>
                        {isVerified ? (
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30">
                                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Driver
                            </Badge>
                        ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 hover:bg-yellow-500/30">
                                <ShieldAlert className="w-3 h-3 mr-1" /> {driver.verification_status === 'rejected' ? 'Verification Rejected' : 'Pending Verification'}
                            </Badge>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-300 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4" /> {driver.email}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4" /> {driver.phone || 'No phone added'}
                        </div>
                    </div>

                    <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
                        {driver.languages_spoken?.map(lang => (
                            <Badge key={lang} variant="outline" className="border-white/30 text-white bg-white/10">
                                {lang === 'KA' ? '🇬🇪 Georgian' : lang === 'EN' ? '🇬🇧 English' : '🇷🇺 Russian'}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Button onClick={onEditClick} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Details & Bio */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" /> About Me
                    </h3>
                    {driver.bio ? (
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{driver.bio}</p>
                    ) : (
                        <p className="text-gray-400 italic">No bio added yet. Click edit to add a description.</p>
                    )}
                </Card>

                {/* Documents Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" /> Documents
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">Upload required documents to get verified. Verified drivers get more bookings.</p>
                    
                    <DocumentUpload 
                        title="ID Card / Passport" 
                        documentType="id"
                        currentUrl={driver.id_document_url}
                        uploadedAt={driver.id_document_uploaded_at}
                        status={driver.verification_status}
                        rejectionReason={driver.verification_rejection_reason}
                        onUploadSuccess={onRefresh}
                        isRequired
                    />
                    
                    <DocumentUpload 
                        title="Driving License" 
                        documentType="license"
                        currentUrl={driver.license_document_url}
                        uploadedAt={driver.license_document_uploaded_at}
                        status={driver.verification_status}
                        rejectionReason={driver.verification_rejection_reason}
                        onUploadSuccess={onRefresh}
                        isRequired
                    />

                    <DocumentUpload 
                        title="Car Registration (Optional)" 
                        documentType="car"
                        currentUrl={driver.car_documents_url}
                        uploadedAt={driver.car_documents_uploaded_at}
                        status={driver.verification_status}
                        rejectionReason={driver.verification_rejection_reason}
                        onUploadSuccess={onRefresh}
                    />
                </div>
            </div>

            {/* Right Column: Checklist */}
            <div className="space-y-6">
                <Card className="p-6 bg-gray-50 border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">Profile Completion</h3>
                        <Badge variant={isComplete ? "default" : "secondary"} className={isComplete ? "bg-green-600" : ""}>
                            {completedCount}/{checklist.length} Completed
                        </Badge>
                    </div>
                    
                    <div className="space-y-3">
                        {checklist.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                                {item.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                                )}
                                <span className={item.completed ? "text-gray-900 font-medium" : "text-gray-500"}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {!isComplete && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-3">
                                Complete your profile to improve your visibility and get verified.
                            </p>
                            <Button variant="outline" size="sm" className="w-full" onClick={onEditClick}>
                                Complete Profile
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    </div>
  );
};

export default ProfileDisplay;