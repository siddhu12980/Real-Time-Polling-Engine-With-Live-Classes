import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClassCard from './ClassCard';
import { useRecoilState, useRecoilValue } from 'recoil';
import { userState } from '../store/userStore';

interface ClassData {
  roomId: string;
  title: string;
  status: 'available' | 'scheduled';
  scheduledTime?: string;
  teacherId?: string;
  subject?: string;
  participants?: number;
}

const Home = () => {

  const navigate = useNavigate()
  const [user, setUser] = useRecoilState(userState)

  // const [classes, setClasses] = useState<ClassData[]>([]);

  //TODO need to implement a route to get all the classsese

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newClass, setNewClass] = useState({
    title: '',
    scheduledTime: '',
    subject: ''
  });

  const [demoClasses, setDemoClasses] = useState([
    {
      roomId: "room1",
      title: "Advanced Mathematics",
      status: "available" as const,
      teacherId: "teacher1",
      subject: "Mathematics",
      participants: 15
    },
    {
      roomId: "room2",
      title: "Physics Lab Session",
      status: "scheduled" as const,
      scheduledTime: "2024-11-25T10:00",
      teacherId: "teacher1",
      subject: "Science",
      participants: 12
    },
    {
      roomId: "room3",
      title: "World History",
      status: "available" as const,
      teacherId: "teacher2",
      subject: "History",
      participants: 18
    },
    {
      roomId: "room4",
      title: "Literature Analysis",
      status: "scheduled" as const,
      scheduledTime: "2024-11-26T14:00",
      teacherId: "teacher1",
      subject: "English",
      participants: 20
    }
  ]);



  const filteredClasses = demoClasses.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || classItem.status === filterStatus;
    return matchesSearch && matchesFilter;
  });


  const handleClassClick = (roomId: string) => {
    if (user.isteacher) {
      navigate(`/video-admin/${roomId}`)
    } else {
      navigate(`/video-user/${roomId}`)
    }
  };

  const handleCreateClass = () => {
    const newClassData: ClassData = {
      roomId: `room${demoClasses.length + 1}`,
      title: newClass.title,
      status: newClass.scheduledTime ? 'scheduled' as const : 'available' as const,
      scheduledTime: newClass.scheduledTime || "",
      teacherId: 'teacher1',
      subject: newClass.subject,
      participants: 10
    };


    setDemoClasses([...demoClasses, newClassData]);
    setNewClass({ title: '', scheduledTime: '', subject: '' });
    setShowModal(false);
  };

  const handleDeleteClass = (roomId: string) => {
    setDemoClasses(demoClasses.filter(classItem => classItem.roomId !== roomId));
  };

  const CreateClassModal = () => (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center ${showModal ? '' : 'hidden'} transition-opacity duration-300`}>
      <div className="bg-white p-8 rounded-xl w-96 shadow-2xl transform transition-transform duration-300 scale-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Class</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class Title</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter class title"
              value={newClass.title}
              onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter subject"
              value={newClass.subject}
              onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time (optional)</label>
            <input
              type="datetime-local"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={newClass.scheduledTime}
              onChange={(e) => setNewClass({ ...newClass, scheduledTime: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleCreateClass}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Virtual Classroom</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.userName}</p>
            </div>
            {user.isteacher && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <span className="text-xl">+</span>
                <span>Create Class</span>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search classes..."
                className="w-full p-3 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
            <select
              className="p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Classes</option>
              <option value="available">Available Now</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem) => (
              <ClassCard key={classItem.roomId} classItem={classItem} handleClassClick={handleClassClick} handleDeleteClass={handleDeleteClass} isTeacher={true} />
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No classes found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
      <CreateClassModal />
    </div>
  );
};

export default Home;
