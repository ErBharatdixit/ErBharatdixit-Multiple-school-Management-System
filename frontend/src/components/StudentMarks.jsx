import { useState, useEffect } from "react";
import { Award, TrendingUp, Calendar } from "lucide-react";
import api from "../api";

export default function StudentMarks() {
      const [marks, setMarks] = useState([]);
      const [stats, setStats] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            fetchMarks();
      }, []);

      const fetchMarks = async () => {
            try {
                  const res = await api.get("/exams/marks/me");
                  setMarks(res.data.marks);
                  setStats(res.data.stats);
            } catch (error) {
                  console.error("Failed to fetch marks:", error);
            } finally {
                  setLoading(false);
            }
      };

      const getGradeColor = (grade) => {
            if (grade.includes('A')) return 'bg-green-100 text-green-700';
            if (grade.includes('B')) return 'bg-blue-100 text-blue-700';
            if (grade.includes('C')) return 'bg-yellow-100 text-yellow-700';
            if (grade === 'D') return 'bg-orange-100 text-orange-700';
            return 'bg-red-100 text-red-700';
      };

      if (loading) {
            return (
                  <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  {/* Statistics Cards */}
                  {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                                    <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 bg-blue-100 rounded-lg">
                                                <Award className="w-5 h-5 text-blue-600" />
                                          </div>
                                          <h3 className="text-sm font-bold text-gray-500 uppercase">Total Exams</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalExams}</p>
                              </div>

                              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                                    <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 bg-green-100 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-green-600" />
                                          </div>
                                          <h3 className="text-sm font-bold text-gray-500 uppercase">Average</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.averagePercentage}%</p>
                              </div>

                              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                                    <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 bg-purple-100 rounded-lg">
                                                <Award className="w-5 h-5 text-purple-600" />
                                          </div>
                                          <h3 className="text-sm font-bold text-gray-500 uppercase">Highest</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.highestPercentage}%</p>
                              </div>

                              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/40">
                                    <div className="flex items-center gap-3 mb-2">
                                          <div className="p-2 bg-orange-100 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                          </div>
                                          <h3 className="text-sm font-bold text-gray-500 uppercase">Lowest</h3>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{stats.lowestPercentage}%</p>
                              </div>
                        </div>
                  )}

                  {/* Marks Table */}
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                              <h2 className="text-xl font-bold text-gray-900">My Exam Results</h2>
                        </div>
                        <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/80">
                                          <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Exam Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Subject
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Date
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Marks
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Percentage
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Grade
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                      Remarks
                                                </th>
                                          </tr>
                                    </thead>
                                    <tbody className="bg-white/60 divide-y divide-gray-200">
                                          {marks.map((mark) => (
                                                <tr key={mark._id} className="hover:bg-blue-50/50 transition">
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900">{mark.examId?.name}</div>
                                                            <div className="text-xs text-gray-500">{mark.examId?.examType}</div>
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {mark.examId?.subjectId?.name}
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {new Date(mark.examId?.date).toLocaleDateString()}
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {mark.marksObtained} / {mark.examId?.totalMarks}
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                            {mark.percentage}%
                                                      </td>
                                                      <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(mark.grade)}`}>
                                                                  {mark.grade}
                                                            </span>
                                                      </td>
                                                      <td className="px-6 py-4 text-sm text-gray-600">
                                                            {mark.remarks || "-"}
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </div>
                  </div>

                  {marks.length === 0 && (
                        <div className="bg-white/80 backdrop-blur-md p-12 rounded-2xl shadow-lg border border-white/40 text-center">
                              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 font-medium">No exam results yet</p>
                              <p className="text-gray-400 text-sm mt-2">Your marks will appear here once exams are graded</p>
                        </div>
                  )}
            </div>
      );
}
