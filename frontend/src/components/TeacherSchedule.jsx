import { useState, useEffect } from "react";
import { Loader, Calendar, Clock, MapPin, BookOpen, AlertCircle } from "lucide-react";
import api from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherSchedule() {
      const [schedule, setSchedule] = useState({});
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

      useEffect(() => {
            fetchTeacherSchedule();
      }, []);

      const fetchTeacherSchedule = async () => {
            try {
                  const res = await api.get("/timetable/teacher/me");
                  setSchedule(res.data);
            } catch (err) {
                  console.error("Failed to fetch teacher schedule", err);
                  setError("Failed to load your schedule.");
            } finally {
                  setLoading(false);
            }
      };

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

      const hasClasses = Object.values(schedule).some(day => day.length > 0);

      if (!hasClasses) {
            return (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No classes assigned to you yet.</p>
                  </div>
            );
      }

      return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              My Weekly Schedule
                        </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                        {DAYS.map(day => {
                              const dayClasses = schedule[day] || [];
                              if (dayClasses.length === 0) return null;

                              return (
                                    <div key={day} className="p-4 hover:bg-gray-50/50 transition">
                                          <div className="flex items-start gap-4">
                                                <div className="w-24 flex-shrink-0 pt-1">
                                                      <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded border border-gray-200">
                                                            {day}
                                                      </span>
                                                </div>
                                                <div className="flex-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                      {dayClasses.map((cls, idx) => (
                                                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition group border-l-4 border-l-primary">
                                                                  <div className="flex justify-between items-start mb-2">
                                                                        <span className="font-bold text-gray-800">{cls.className}</span>
                                                                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                                                              {cls.startTime} - {cls.endTime}
                                                                        </span>
                                                                  </div>
                                                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                        <BookOpen className="w-3 h-3" />
                                                                        <span>{cls.subject}</span>
                                                                  </div>
                                                                  {/* If we had room number, we'd show it here often */}
                                                            </div>
                                                      ))}
                                                </div>
                                          </div>
                                    </div>
                              );
                        })}
                  </div>
            </div>
      );
}
