import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AppLayout } from "@/components/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Edit, Save, X, User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Users, Clock } from "lucide-react";

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  joinDate: string;
  subjects: string[];
  qualifications: string[];
  experience: string;
  bio: string;
  avatar: string;
  totalStudents: number;
  totalClasses: number;
  yearsExperience: number;
  specializations: string[];
}

const TeacherProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>({
    id: user?.id || "1",
    name: user?.name || "Dr. Sarah Johnson",
    email: user?.email || "sarah.johnson@school.edu",
    phone: "+1 (555) 123-4567",
    address: "123 Education Street, Learning City, LC 12345",
    dateOfBirth: "1985-03-15",
    joinDate: "2020-08-01",
    subjects: ["Mathematics", "Physics", "Computer Science"],
    qualifications: ["Ph.D. in Mathematics", "M.Sc. in Physics", "B.Ed. in Education"],
    experience: "8 years of teaching experience in secondary and higher education",
    bio: "Passionate educator dedicated to making complex mathematical and scientific concepts accessible to all students. Specializes in interactive learning methods and technology integration.",
    avatar: "",
    totalStudents: 156,
    totalClasses: 8,
    yearsExperience: 8,
    specializations: ["STEM Education", "Interactive Learning", "Technology Integration", "Student Assessment"]
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  useEffect(() => {
    // Load teacher profile from localStorage or database
    const savedProfile = localStorage.getItem('teacherProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
      setEditedProfile(parsed);
    }
    
    // Calculate actual stats
    calculateActualStats();
  }, [user?.id]);

  const calculateActualStats = () => {
    try {
      const teacherId = user?.id || 'teacher_001';
      
      // Get teacher's classes
      const teacherClasses = JSON.parse(localStorage.getItem('teacherClasses') || '[]');
      const myClasses = teacherClasses.filter((cls) => cls.teacherId === teacherId);
      
      // Get class enrollments
      const classEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
      
      // Count unique students
      const uniqueStudents = new Set();
      myClasses.forEach(cls => {
        const enrolledStudents = classEnrollments[cls.id] || [];
        enrolledStudents.forEach(student => {
          const studentKey = `${student.studentName}-${student.studentEmail}`;
          uniqueStudents.add(studentKey);
        });
      });
      
      // Update profile with actual counts
      setProfile(prev => ({
        ...prev,
        totalStudents: uniqueStudents.size,
        totalClasses: myClasses.length
      }));
      
      setEditedProfile(prev => ({
        ...prev,
        totalStudents: uniqueStudents.size,
        totalClasses: myClasses.length
      }));
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const handleSave = () => {
    setProfile(editedProfile);
    localStorage.setItem('teacherProfile', JSON.stringify(editedProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof TeacherProfile, value: string | string[]) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSubject = (subject: string) => {
    if (subject && !editedProfile.subjects.includes(subject)) {
      handleInputChange('subjects', [...editedProfile.subjects, subject]);
    }
  };

  const removeSubject = (subject: string) => {
    handleInputChange('subjects', editedProfile.subjects.filter(s => s !== subject));
  };

  const addQualification = (qualification: string) => {
    if (qualification && !editedProfile.qualifications.includes(qualification)) {
      handleInputChange('qualifications', [...editedProfile.qualifications, qualification]);
    }
  };

  const removeQualification = (qualification: string) => {
    handleInputChange('qualifications', editedProfile.qualifications.filter(q => q !== qualification));
  };

  return (
    <AppLayout role="teacher" title="Teacher Profile">
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/teacher/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <Input
                    value={editedProfile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-center font-semibold"
                  />
                ) : (
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                )}
                <p className="text-muted-foreground">Teacher</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{profile.totalStudents}</div>
                    <div className="text-sm text-muted-foreground">Students</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{profile.totalClasses}</div>
                    <div className="text-sm text-muted-foreground">Classes</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{profile.yearsExperience}</div>
                    <div className="text-sm text-muted-foreground">Years</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Specializations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.specializations.map((spec, index) => (
                    <Badge key={index} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1">{profile.email}</p>
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1">{profile.phone}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1">{profile.address}</p>
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date of Birth
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProfile.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Join Date
                    </Label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedProfile.joinDate}
                        onChange={(e) => handleInputChange('joinDate', e.target.value)}
                      />
                    ) : (
                      <p className="mt-1">{new Date(profile.joinDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teaching Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Teaching Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Subjects</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(isEditing ? editedProfile.subjects : profile.subjects).map((subject, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {subject}
                        {isEditing && (
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeSubject(subject)}
                          />
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Input
                        placeholder="Add subject"
                        className="w-32 h-8"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addSubject(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Qualifications</Label>
                  <div className="space-y-2 mt-2">
                    {(isEditing ? editedProfile.qualifications : profile.qualifications).map((qual, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <span className="text-gray-800">{qual}</span>
                        {isEditing && (
                          <X 
                            className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700" 
                            onClick={() => removeQualification(qual)}
                          />
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Input
                        placeholder="Add qualification"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addQualification(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <Label>Experience</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProfile.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2">{profile.experience}</p>
                  )}
                </div>

                <div>
                  <Label>Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={editedProfile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="mt-2"
                      rows={4}
                    />
                  ) : (
                    <p className="mt-2">{profile.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default TeacherProfilePage;