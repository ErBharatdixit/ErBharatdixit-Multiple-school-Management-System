import { useState, useEffect } from "react";
import { Save, Loader, Calendar, BookOpen, Clock, Plus, Trash2, Edit2 } from "lucide-react";
import api from "../api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableManager() {
      const [classes, setClasses] = useState([]);
      const [selectedClass, setSelectedClass] = useState("");
      const [schedule, setSchedule] = useState({});
      const [periods, setPeriods] = useState([]);
      const [subjects, setSubjects] = useState([]);
      const [teachers, setTeachers] = useState([]);

      const [loading, setLoading] = useState(false);
      const [saving, setSaving] = useState(false);

      // Period Editing State
      const [isAddingPeriod, setIsAddingPeriod] = useState(false);
      const [newPeriod, setNewPeriod] = useState({ startTime: "", endTime: "" });

      useEffect(() => {
            fetchClasses();
            fetchSubjects();
            fetchTeachers();
      }, []);

      useEffect(() => {
            if (selectedClass) {
                  fetchTimetable(selectedClass);
            } else {
                  setSchedule({});
                  setPeriods([]);
            }
      }, [selectedClass]);

      const fetchClasses = async () => {
            try {
                  const res = await api.get("/academic/classes");
                  setClasses(res.data);
            } catch (err) {
                  console.error("Failed to fetch classes", err);
            }
      };

      const fetchSubjects = async () => {
            try {
                  const res = await api.get("/academic/subjects");
                  setSubjects(res.data);
            } catch (err) {
                  console.error("Failed to fetch subjects", err);
            }
      };

      const fetchTeachers = async () => {
            try {
                  const res = await api.get("/users/teachers");
                  setTeachers(res.data);
            } catch (err) {
                  console.error("Failed to fetch teachers", err);
            }
      };

      const fetchTimetable = async (classId) => {
            setLoading(true);
            try {
                  const res = await api.get(`/timetable/${classId}`);
                  const fetchedSchedule = res.data.schedule || {};
                  const fetchedPeriods = res.data.periods || [];

                  // Sort periods by start time
                  fetchedPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));
                  setPeriods(fetchedPeriods);

                  const initializedSchedule = {};
                  DAYS.forEach(day => {
                        initializedSchedule[day] = fetchedSchedule[day] || [];
                  });
                  setSchedule(initializedSchedule);
            } catch (err) {
                  console.error("Failed to fetch timetable", err);
                  const empty = {};
                  DAYS.forEach(day => empty[day] = []);
                  setSchedule(empty);
                  setPeriods([]);
            } finally {
                  setLoading(false);
            }
      };

      const handleAddPeriod = () => {
            if (!newPeriod.startTime || !newPeriod.endTime) {
                  alert("Please enter both start and end times.");
                  return;
            }
            if (newPeriod.startTime >= newPeriod.endTime) {
                  alert("Start time must be before end time.");
                  return;
            }

            const updatedPeriods = [...periods, { ...newPeriod, periodNumber: periods.length + 1 }];
            updatedPeriods.sort((a, b) => a.startTime.localeCompare(b.startTime));
            setPeriods(updatedPeriods);
            setNewPeriod({ startTime: "", endTime: "" });
            setIsAddingPeriod(false);
      };

      const handleRemovePeriod = (index) => {
            if (window.confirm("Are you sure you want to remove this period? This will delete all entries for this time slot.")) {
                  const updatedPeriods = periods.filter((_, i) => i !== index);
                  setPeriods(updatedPeriods);
                  // Optional: Clean up schedule data for removed period index if relying on index linkage
                  // But since we store full objects in schedule, we might just let them be or filter them on save
            }
      };

      const handleCellChange = (day, periodIndex, field, value) => {
            const newSchedule = { ...schedule };
            if (!newSchedule[day]) newSchedule[day] = [];

            // Ensure we have an object at this index
            if (!newSchedule[day][periodIndex]) {
                  newSchedule[day][periodIndex] = {
                        subject: "",
                        teacher: "",
                        startTime: periods[periodIndex].startTime,
                        endTime: periods[periodIndex].endTime
                  };
            } else {
                  // Ensure times are synced with current period definition
                  newSchedule[day][periodIndex].startTime = periods[periodIndex].startTime;
                  newSchedule[day][periodIndex].endTime = periods[periodIndex].endTime;
            }

            newSchedule[day][periodIndex][field] = value;
            setSchedule(newSchedule);
      };

      const saveTimetable = async () => {
            if (!selectedClass) return;
            setSaving(true);
            try {
                  // Clean up schedule before saving: Ensure entries match current periods
                  const cleanSchedule = {};
                  DAYS.forEach(day => {
                        cleanSchedule[day] = periods.map((period, index) => {
                              const existingEntry = schedule[day]?.[index];
                              return {
                                    subject: existingEntry?.subject || "",
                                    teacher: existingEntry?.teacher || "",
                                    startTime: period.startTime,
                                    endTime: period.endTime
                              };
                        });
                  });

                  await api.post("/timetable", {
                        classId: selectedClass,
                        schedule: cleanSchedule,
                        periods: periods
                  });
                  alert("Timetable saved successfully!");
            } catch (err) {
                  console.error("Failed to save timetable", err);
                  alert("Failed to save timetable. " + (err.response?.data?.message || ""));
            } finally {
                  setSaving(false);
            }
      };

      return (
            <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <div className="relative w-full md:w-64">
                              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Select Class</label>
                              <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                              >
                                    <option value="">-- Choose a Class --</option>
                                    {classes.map(cls => (
                                          <option key={cls._id} value={cls._id}>{cls.name}</option>
                                    ))}
                              </select>
                        </div>

                        {selectedClass && (
                              <div className="flex items-center gap-2">
                                    <button
                                          onClick={saveTimetable}
                                          disabled={saving}
                                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                                    >
                                          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                          Save Changes
                                    </button>
                              </div>
                        )}
                  </div>

                  {selectedClass ? (
                        loading ? (
                              <div className="flex justify-center p-12">
                                    <Loader className="w-8 h-8 animate-spin text-primary" />
                              </div>
                        ) : (
                              <div className="space-y-6">
                                    {/* Period Management */}
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Manage Class Periods
                                          </h3>

                                          <div className="flex flex-wrap gap-2 mb-4">
                                                {periods.map((period, index) => (
                                                      <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm border border-gray-200">
                                                            <span className="font-medium text-gray-600">{index + 1}.</span>
                                                            <span>{period.startTime} - {period.endTime}</span>
                                                            <button
                                                                  onClick={() => handleRemovePeriod(index)}
                                                                  className="text-gray-400 hover:text-red-500 transition"
                                                            >
                                                                  <Trash2 className="w-3 h-3" />
                                                            </button>
                                                      </div>
                                                ))}
                                                {periods.length === 0 && <span className="text-gray-400 text-sm italic">No periods defined. Add one below.</span>}
                                          </div>

                                          {isAddingPeriod ? (
                                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                                      <input
                                                            type="time"
                                                            value={newPeriod.startTime}
                                                            onChange={(e) => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
                                                            className="border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                                                      />
                                                      <span className="text-gray-400">-</span>
                                                      <input
                                                            type="time"
                                                            value={newPeriod.endTime}
                                                            onChange={(e) => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
                                                            className="border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm"
                                                      />
                                                      <button
                                                            onClick={handleAddPeriod}
                                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition"
                                                      >
                                                            Add
                                                      </button>
                                                      <button
                                                            onClick={() => setIsAddingPeriod(false)}
                                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition"
                                                      >
                                                            Cancel
                                                      </button>
                                                </div>
                                          ) : (
                                                <button
                                                      onClick={() => setIsAddingPeriod(true)}
                                                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition"
                                                >
                                                      <Plus className="w-3 h-3" />
                                                      Add Period
                                                </button>
                                          )}
                                    </div>

                                    {/* Timetable Grid */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
                                          <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                      <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-24">Day</th>
                                                            {periods.map((period, i) => (
                                                                  <th key={i} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                                              <span className="font-bold">Period {i + 1}</span>
                                                                              <span className="font-normal text-gray-400">{period.startTime} - {period.endTime}</span>
                                                                        </div>
                                                                  </th>
                                                            ))}
                                                      </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                      {DAYS.map(day => (
                                                            <tr key={day} className="hover:bg-gray-50">
                                                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                                                                        <div className="flex items-center gap-2">
                                                                              <Calendar className="w-4 h-4 text-gray-400" />
                                                                              {day}
                                                                        </div>
                                                                  </td>
                                                                  {periods.map((period, i) => {
                                                                        const cellData = schedule[day]?.[i] || {};
                                                                        return (
                                                                              <td key={i} className="px-2 py-2">
                                                                                    <div className="flex flex-col gap-2">
                                                                                          <select
                                                                                                value={cellData.subject || ""}
                                                                                                onChange={(e) => handleCellChange(day, i, "subject", e.target.value)}
                                                                                                className="w-full text-xs border-gray-200 rounded-md focus:ring-1 focus:ring-primary focus:border-primary p-1"
                                                                                          >
                                                                                                <option value="">- Subject -</option>
                                                                                                {subjects.map(sub => (
                                                                                                      <option key={sub._id} value={sub.name}>{sub.name}</option>
                                                                                                ))}
                                                                                          </select>
                                                                                          <select
                                                                                                value={cellData.teacher || ""}
                                                                                                onChange={(e) => handleCellChange(day, i, "teacher", e.target.value)}
                                                                                                className="w-full text-xs border-gray-200 rounded-md focus:ring-1 focus:ring-primary focus:border-primary p-1 text-gray-600"
                                                                                          >
                                                                                                <option value="">- Teacher -</option>
                                                                                                {teachers.map(teacher => (
                                                                                                      <option key={teacher._id} value={teacher.name}>{teacher.name}</option>
                                                                                                ))}
                                                                                          </select>
                                                                                    </div>
                                                                              </td>
                                                                        );
                                                                  })}
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              </div>
                        )
                  ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">Select a class to manage its timetable.</p>
                        </div>
                  )}
            </div>
      );
}
