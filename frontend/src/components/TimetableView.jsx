import { useState, useEffect } from "react";
import { Loader, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import api from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableView({ classId }) {
      const [schedule, setSchedule] = useState(null);
      const [periods, setPeriods] = useState([]);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState("");

      useEffect(() => {
            if (classId) {
                  fetchTimetable();
            }
      }, [classId]);

      const fetchTimetable = async () => {
            setLoading(true);
            setError("");
            try {
                  const res = await api.get(`/timetable/${classId}`);
                  setSchedule(res.data.schedule || {});

                  const fetchedPeriods = res.data.periods || [];
                  fetchedPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));
                  setPeriods(fetchedPeriods);

            } catch (err) {
                  console.error("Failed to fetch timetable", err);
                  // If 404, it might just mean no timetable created yet
                  if (err.response && err.response.status === 404) {
                        setSchedule({});
                        setPeriods([]);
                  } else {
                        setError("Could not load timetable.");
                  }
            } finally {
                  setLoading(false);
            }
      };

      if (!classId) {
            return (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No class selected.</p>
                  </div>
            );
      }

      if (loading) {
            return (
                  <div className="flex justify-center p-12">
                        <Loader className="w-8 h-8 animate-spin text-primary" />
                  </div>
            );
      }

      if (error) {
            return (
                  <div className="text-center py-12 bg-red-50 rounded-xl">
                        <p className="text-red-500">{error}</p>
                  </div>
            );
      }

      if (!schedule || Object.keys(schedule).length === 0 || periods.length === 0) {
            return (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Timetable has not been published for this class yet.</p>
                  </div>
            );
      }

      return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                              <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Day</th>
                                    {periods.map((period, i) => (
                                          <th key={i} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                                                <div className="flex flex-col items-center justify-center gap-1">
                                                      <span className="font-bold text-gray-700">Period {i + 1}</span>
                                                      <span className="flex items-center gap-1 font-normal">
                                                            <Clock className="w-3 h-3" />
                                                            {period.startTime} - {period.endTime}
                                                      </span>
                                                </div>
                                          </th>
                                    ))}
                              </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                              {DAYS.map(day => (
                                    <tr key={day} className="hover:bg-gray-50 transition">
                                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-primary sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                                <div className="flex items-center gap-2">
                                                      <Calendar className="w-4 h-4 text-gray-400" />
                                                      {day}
                                                </div>
                                          </td>
                                          {periods.map((period, i) => {
                                                // Find matching schedule entry for this period's start time, or fall back to index if times match
                                                const cellData = schedule[day]?.find(p => p.startTime === period.startTime) || schedule[day]?.[i] || {};

                                                // Double check if using index fallback: ensure times roughly match or it's a legacy entry
                                                const displaySubject = cellData.subject;
                                                const displayTeacher = cellData.teacher;

                                                return (
                                                      <td key={i} className="px-2 py-2 text-center align-middle">
                                                            {displaySubject ? (
                                                                  <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 hover:shadow-sm transition">
                                                                        <div className="font-bold text-indigo-700 text-sm">{displaySubject}</div>
                                                                        {displayTeacher && (
                                                                              <div className="text-xs text-indigo-500 mt-1">{displayTeacher}</div>
                                                                        )}
                                                                  </div>
                                                            ) : (
                                                                  <span className="text-gray-300 text-xs">-</span>
                                                            )}
                                                      </td>
                                                );
                                          })}
                                    </tr>
                              ))}
                        </tbody>
                  </table>
            </div>
      );
}
