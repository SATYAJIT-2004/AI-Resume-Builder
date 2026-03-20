import React, { useEffect, useState } from "react";
import {
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api";
import pdfToText from "react-pdftotext";

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);

  const colors = ["#9333ea", "#d97706", "#dc2626", "#0284c7", "#16a34a"];
  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get("/api/users/resumes", {
        headers: { Authorization: token },
      });
      setAllResumes(data.resumes);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const createResume = async (event) => {
    try {
      event.preventDefault();
      const { data } = await api.post(
        "/api/resumes/create",
        { title },
        { headers: { Authorization: token } }
      );
      setAllResumes([...allResumes, data.resume]);
      setTitle("");
      setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post(
        "/api/ai/upload-resume",
        { title, resumeText },
        { headers: { Authorization: token } }
      );
      setTitle("");
      setResume(null);
      setShowUploadResume(false);
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const editTitle = async (event) => {
    try {
      event.preventDefault();
      const { data } = await api.put(
        `/api/resumes/update`,
        { resumeId: editResumeId, resumeData: { title } },
        { headers: { Authorization: token } }
      );
      setAllResumes(
        allResumes.map((resume) =>
          resume._id === editResumeId ? { ...resume, title } : resume
        )
      );
      setTitle("");
      setEditResumeId("");
      toast.success(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const deleteResume = async (resumeId) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this Resume?"
    );

    if (confirm) {
      try {
        const { data } = await api.delete(`/api/resumes/delete/${resumeId}`, {
          headers: { Authorization: token },
        });
        setAllResumes(allResumes.filter((r) => r._id !== resumeId));
        toast.success(data.message);
      } catch (error) {
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  };

  useEffect(() => {
    loadAllResumes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and build your professional resumes
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <button
            onClick={() => setShowCreateResume(true)}
            className="h-40 rounded-xl bg-white border border-dashed hover:shadow-xl transition flex flex-col items-center justify-center gap-3"
          >
            <PlusIcon className="size-10 text-indigo-500" />
            <p className="text-sm font-medium text-slate-600">
              Create Resume
            </p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className="h-40 rounded-xl bg-white border border-dashed hover:shadow-xl transition flex flex-col items-center justify-center gap-3"
          >
            <UploadCloudIcon className="size-10 text-purple-500" />
            <p className="text-sm font-medium text-slate-600">
              Upload Resume
            </p>
          </button>
        </div>

        {/* Resume Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {allResumes.map((resume, index) => {
            const baseColor = colors[index % colors.length];
            return (
              <div
                key={resume._id}
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                className="relative group p-4 rounded-xl cursor-pointer bg-white shadow-sm hover:shadow-xl transition"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: baseColor + "20" }}
                >
                  <FilePenLineIcon style={{ color: baseColor }} />
                </div>

                <h3 className="text-sm font-semibold text-slate-700 truncate">
                  {resume.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                  <TrashIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteResume(resume._id);
                    }}
                    className="size-6 p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  />
                  <PencilIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditResumeId(resume._id);
                      setTitle(resume.title);
                    }}
                    className="size-6 p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Base */}
        {(showCreateResume || showUploadResume || editResumeId) && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
              <XIcon
                className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600"
                onClick={() => {
                  setShowCreateResume(false);
                  setShowUploadResume(false);
                  setEditResumeId("");
                  setTitle("");
                }}
              />

              {/* Create */}
              {showCreateResume && (
                <form onSubmit={createResume}>
                  <h2 className="text-lg font-semibold mb-4">
                    Create Resume
                  </h2>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2"
                    required
                  />
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                    Create
                  </button>
                </form>
              )}

              {/* Upload */}
              {showUploadResume && (
                <form onSubmit={uploadResume}>
                  <h2 className="text-lg font-semibold mb-4">
                    Upload Resume
                  </h2>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                    required
                  />

                  <label className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer block mb-4">
                    {resume ? resume.name : "Click to upload PDF"}
                    <input
                      type="file"
                      hidden
                      accept=".pdf"
                      onChange={(e) => setResume(e.target.files[0])}
                    />
                  </label>

                  <button
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white py-2 rounded-lg flex justify-center items-center gap-2"
                  >
                    {isLoading && (
                      <LoaderCircleIcon className="animate-spin size-4" />
                    )}
                    {isLoading ? "Uploading..." : "Upload"}
                  </button>
                </form>
              )}

              {/* Edit */}
              {editResumeId && (
                <form onSubmit={editTitle}>
                  <h2 className="text-lg font-semibold mb-4">
                    Edit Title
                  </h2>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 mb-4"
                    required
                  />
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg">
                    Update
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
