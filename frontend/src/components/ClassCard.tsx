
interface ClassData {
  roomId: string;
  title: string;
  status: 'available' | 'scheduled';
  scheduledTime?: string;
  teacherId?: string;
  subject?: string;
  participants?: number;
}

const ClassCard = ({ classItem, isTeacher, handleDeleteClass, handleClassClick }: { classItem: ClassData, isTeacher: boolean, handleDeleteClass: (roomId: string) => void, handleClassClick: (roomId: string) => void }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-gray-800">{classItem.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${classItem.status === 'available'
            ? 'bg-green-100 text-green-600'
            : 'bg-orange-100 text-orange-600'
            }`}>
            {classItem.status === 'available' ? '● Live Now' : '○ Scheduled'}
          </span>
          <span className="text-sm text-gray-500">
            {classItem.participants} participants
          </span>
        </div>
        <p className="text-gray-600 text-sm">{classItem.subject}</p>
        {classItem.scheduledTime && (
          <p className="text-sm text-gray-600 flex items-center">
            <span className="mr-2">🕒</span>
            {new Date(classItem.scheduledTime).toLocaleString()}
          </p>
        )}
      </div>
      {isTeacher && (
        <button

          onClick={() => handleDeleteClass(classItem.roomId)}

          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
        >
          ×
        </button>
      )}
    </div>
    <button
      onClick={() => handleClassClick(classItem.roomId)}

      className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 flex items-center justify-center space-x-2"
    >
      <span>Join Class</span>
      <span className="text-lg">→</span>
    </button>
  </div>
);

export default ClassCard;
