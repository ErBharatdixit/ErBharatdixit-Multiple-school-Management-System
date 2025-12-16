import { useState, useEffect } from "react";
import {
      Plus,
      Edit,
      Trash2,
      BookOpen,
      Calendar,
      Clock,
      Award,
      FileText,
      Users,
      TrendingUp,
      Filter,
      Search,
      Download,
      Eye
} from "lucide-react";
import api from "../api";
import AddExamModal from "./AddExamModal";
import MarkEntry from "./MarkEntry";

export default function ExamManager() {
      const [activeTab, setActiveTab] = useState("exams");
      const [exams, setExams] = useState([]);
      const [loading, setLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [selectedExam, setSelectedExam] = useState(null);
      const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);
      const [filterClass, setFilterClass] = useState("");
      const [filterSubject, setFilterSubject] = useState("");
      const [filterExamType, setFilterExamType] = useState("");
      const [searchTerm, setSearchTerm] = useState("");
      const [classes, setClasses] = useState([]);
      const [subjects, setSubjects] = useState([]);
      const [stats, setStats] = useState({
            totalExams: 0,
            upcomingExams: 0,
            completedExams: 0,
            pendingMarks: 0
      });

      const examTypes = ["Mid-Term", "Final", "Quiz", "Unit Test", "Assignment"];

      useEffect(() => {
            fetchExams();
            fetchClasses();
            fetchSubjects();
      }, [filterClass, filterSubject, filterExamType]);

      const fetchExams = async () => {
            try {
                  setLoading(true);
                  const params = {};
                  if (filterClass) params.classId = filterClass;
                  if (filterSubject) params.subjectId = filterSubject;

                  const res = await api.get("/exams", { params });
                  let examData = res.data;

                  // Filter by exam type if selected
                  if (filterExamType) {
                        examData = examData.filter(exam => exam.examType === filterExamType);
                  }

                  // Filter by search term
                  if (searchTerm) {
                        examData = examData.filter(exam =>
                              exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              exam.subjectId?.name.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                  }

                  setExams(examData);
                  calculateStats(examData);
            } catch (error) {
                  console.error("Failed to fetch exams:", error);
            } finally {
                  setLoading(false);
            }
      };

      const calculateStats = (examData) => {
            const now = new Date();
            const upcoming = examData.filter(exam => new Date(exam.date) > now).length;
            const completed = examData.filter(exam => new Date(exam.date) <= now).length;

            setStats({
                  totalExams: examData.length,
                  upcomingExams: upcoming,
                  completedExams: completed,
                  pendingMarks: 0 // This would need additional API call to check marks status
            });
      };

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (error) {
                  console.error("Failed to fetch classes:", error);
            }
      };

      const fetchSubjects = async () => {
            try {
                  const res = await api.get("/academic/subjects");
                  setSubjects(res.data);
            } catch (error) {
                  console.error("Failed to fetch subjects:", error);
            }
      };

      const handleDelete = async (id) => {
            if (window.confirm("Are you sure you want to delete this exam? All marks will also be deleted.")) {
                  try {
                        await api.delete(`/exams/${id}`);
                        fetchExams();
                  } catch (error) {
                        console.error("Failed to delete exam:", error);
                        alert("Failed to delete exam");
                  }
            }
      };

      const handleEdit = (exam) => {
            setSelectedExam(exam);
            setIsModalOpen(true);
      };

      const handleModalClose = () => {
            setIsModalOpen(false);
            setSelectedExam(null);
      };

      const handleEnterMarks = (exam) => {
            setSelectedExamForMarks(exam._id);
            setActiveTab("marks");
      };

      const handleViewMarks = async (examId) => {
            try {
                  const res = await api.get(`/exams/${examId}/marks`);
                  // TODO: Show marks in a modal or navigate to marks view

                  alert(`Total marks entered: ${res.data.length}`);
            } catch (error) {
                  console.error("Failed to fetch marks:", error);
            }
      };

      const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
            });
      };

      const getExamStatus = (examDate) => {
            const now = new Date();
            const exam = new Date(examDate);

            if (exam > now) {
                  return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
            } else {
                  return { label: "Completed", color: "bg-green-100 text-green-700" };
            }
      };

      const clearFilters = () => {
            setFilterClass("");
            setFilterSubject("");
            setFilterExamType("");
            setSearchTerm("");
      };

      if (loading && exams.length === 0) {
            return (
                  <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                              <h1 className="text-3xl font-bold text-gray-900">Exam Manager</h1>
                              <p className="text-gray-600 mt-1">Manage exams and enter marks</p>
                        </div>
                        <button
                              onClick={() => setIsModalOpen(true)}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-lg hover:shadow-xl"
                        >
                              <Plus className="w-5 h-5" />
                              Create Exam
                        </button>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg text-white">
                              <div className="flex items-center justify-between">
                                    <div>
                                          <p className="text-blue-100 text-sm font-medium">Total Exams</p>
                                          <p className="text-3xl font-bold mt-2">{stats.totalExams}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl">
                                          <BookOpen className="w-8 h-8" />
                                    </div>
                              </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg text-white">
                              <div className="flex items-center justify-between">
                                    <div>
                                          <p className="text-green-100 text-sm font-medium">Upcoming</p>
                                          <p className="text-3xl font-bold mt-2">{stats.upcomingExams}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl">
                                          <Calendar className="w-8 h-8" />
                                    </div>
                              </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
                              <div className="flex items-center justify-between">
                                    <div>
                                          <p className="text-purple-100 text-sm font-medium">Completed</p>
                                          <p className="text-3xl font-bold mt-2">{stats.completedExams}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl">
                                          <Award className="w-8 h-8" />
                                    </div>
                              </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg text-white">
                              <div className="flex items-center justify-between">
                                    <div>
                                          <p className="text-orange-100 text-sm font-medium">Pending Marks</p>
                                          <p className="text-3xl font-bold mt-2">{stats.pendingMarks}</p>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-xl">
                                          <FileText className="w-8 h-8" />
                                    </div>
                              </div>
                        </div>
                  </div>

                  {/* Tabs */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                        <div className="border-b border-gray-200">
                              <nav className="flex -mb-px">
                                    <button
                                          onClick={() => {
                                                setActiveTab("exams");
                                                setSelectedExamForMarks(null);
                                          }}
                                          className={`px-8 py-4 text-sm font-bold border-b-2 transition ${activeTab === "exams"
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                    >
                                          <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                Exam List
                                          </div>
                                    </button>
                                    <button
                                          onClick={() => setActiveTab("marks")}
                                          className={`px-8 py-4 text-sm font-bold border-b-2 transition ${activeTab === "marks"
                                                ? "border-blue-600 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                }`}
                                    >
                                          <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                Mark Entry
                                          </div>
                                    </button>
                              </nav>
                        </div>

                        <div className="p-6">
                              {activeTab === "exams" ? (
                                    <>
                                          {/* Filters and Search */}
                                          <div className="mb-6 space-y-4">
                                                <div className="flex flex-col md:flex-row gap-4">
                                                      {/* Search */}
                                                      <div className="flex-1 relative">
                                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                            <input
                                                                  type="text"
                                                                  placeholder="Search exams..."
                                                                  value={searchTerm}
                                                                  onChange={(e) => setSearchTerm(e.target.value)}
                                                                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            />
                                                      </div>

                                                      {/* Class Filter */}
                                                      <select
                                                            value={filterClass}
                                                            onChange={(e) => setFilterClass(e.target.value)}
                                                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                      >
                                                            <option value="">All Classes</option>
                                                            {classes.map((cls) => (
                                                                  <option key={cls._id} value={cls._id}>
                                                                        {cls.name} - Section {cls.section}
                                                                  </option>
                                                            ))}
                                                      </select>

                                                      {/* Subject Filter */}
                                                      <select
                                                            value={filterSubject}
                                                            onChange={(e) => setFilterSubject(e.target.value)}
                                                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                      >
                                                            <option value="">All Subjects</option>
                                                            {subjects.map((subject) => (
                                                                  <option key={subject._id} value={subject._id}>
                                                                        {subject.name}
                                                                  </option>
                                                            ))}
                                                      </select>

                                                      {/* Exam Type Filter */}
                                                      <select
                                                            value={filterExamType}
                                                            onChange={(e) => setFilterExamType(e.target.value)}
                                                            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                      >
                                                            <option value="">All Types</option>
                                                            {examTypes.map((type) => (
                                                                  <option key={type} value={type}>
                                                                        {type}
                                                                  </option>
                                                            ))}
                                                      </select>

                                                      {/* Clear Filters */}
                                                      {(filterClass || filterSubject || filterExamType || searchTerm) && (
                                                            <button
                                                                  onClick={clearFilters}
                                                                  className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                                            >
                                                                  Clear
                                                            </button>
                                                      )}
                                                </div>
                                          </div>

                                          {/* Exam Cards */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {exams.map((exam) => {
                                                      const status = getExamStatus(exam.date);
                                                      return (
                                                            <div
                                                                  key={exam._id}
                                                                  className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40 hover:shadow-xl transition group"
                                                            >
                                                                  <div className="flex justify-between items-start mb-4">
                                                                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-blue-600">
                                                                              <BookOpen className="w-6 h-6" />
                                                                        </div>
                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                                              <button
                                                                                    onClick={() => handleEdit(exam)}
                                                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                                    title="Edit Exam"
                                                                              >
                                                                                    <Edit className="w-4 h-4" />
                                                                              </button>
                                                                              <button
                                                                                    onClick={() => handleDelete(exam._id)}
                                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                                    title="Delete Exam"
                                                                              >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                              </button>
                                                                        </div>
                                                                  </div>

                                                                  <h3 className="text-xl font-bold text-gray-900 mb-3">{exam.name}</h3>

                                                                  <div className="space-y-2 mb-4">
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                              <Award className="w-4 h-4 text-gray-400" />
                                                                              <span className="font-medium">{exam.subjectId?.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                              <BookOpen className="w-4 h-4 text-gray-400" />
                                                                              <span>{exam.classId?.name} - Section {exam.classId?.section}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                              <Calendar className="w-4 h-4 text-gray-400" />
                                                                              <span>{formatDate(exam.date)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                              <Clock className="w-4 h-4 text-gray-400" />
                                                                              <span>{exam.duration} minutes</span>
                                                                        </div>
                                                                  </div>

                                                                  <div className="pt-4 border-t border-gray-100 space-y-3">
                                                                        <div className="flex justify-between items-center">
                                                                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                                                                    {status.label}
                                                                              </span>
                                                                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                                                                                    {exam.examType}
                                                                              </span>
                                                                        </div>
                                                                        <div className="flex justify-between items-center">
                                                                              <span className="text-sm font-bold text-gray-700">
                                                                                    {exam.totalMarks} Marks
                                                                              </span>
                                                                              <span className="text-xs text-gray-500">
                                                                                    Pass: {exam.passingMarks}
                                                                              </span>
                                                                        </div>

                                                                        {/* Action Buttons */}
                                                                        <div className="flex gap-2 pt-2">
                                                                              <button
                                                                                    onClick={() => handleEnterMarks(exam)}
                                                                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-1"
                                                                              >
                                                                                    <FileText className="w-4 h-4" />
                                                                                    Enter Marks
                                                                              </button>
                                                                              <button
                                                                                    onClick={() => handleViewMarks(exam._id)}
                                                                                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition"
                                                                                    title="View Marks"
                                                                              >
                                                                                    <Eye className="w-4 h-4" />
                                                                              </button>
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          {exams.length === 0 && (
                                                <div className="bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-lg border border-white/40 text-center">
                                                      <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                      <p className="text-gray-500 font-medium text-lg">No exams found</p>
                                                      <p className="text-gray-400 text-sm mt-2">
                                                            {searchTerm || filterClass || filterSubject || filterExamType
                                                                  ? "Try adjusting your filters"
                                                                  : "Create your first exam to get started"}
                                                      </p>
                                                </div>
                                          )}
                                    </>
                              ) : (
                                    <div>
                                          {selectedExamForMarks ? (
                                                <MarkEntry
                                                      examId={selectedExamForMarks}
                                                      onClose={() => {
                                                            setSelectedExamForMarks(null);
                                                            setActiveTab("exams");
                                                      }}
                                                />
                                          ) : (
                                                <div className="bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-lg border border-white/40 text-center">
                                                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                      <p className="text-gray-500 font-medium text-lg">Select an exam to enter marks</p>
                                                      <p className="text-gray-400 text-sm mt-2">
                                                            Go to the Exam List tab and click "Enter Marks" on any exam
                                                      </p>
                                                      <button
                                                            onClick={() => setActiveTab("exams")}
                                                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                      >
                                                            Go to Exam List
                                                      </button>
                                                </div>
                                          )}
                                    </div>
                              )}
                        </div>
                  </div>

                  {/* Add/Edit Exam Modal */}
                  <AddExamModal
                        isOpen={isModalOpen}
                        onClose={handleModalClose}
                        onExamAdded={fetchExams}
                        initialData={selectedExam}
                  />
            </div>
      );
}
