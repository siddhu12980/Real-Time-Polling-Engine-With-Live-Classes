
const UserLabel = ({ userId, name }: {
  userId: string,
  name: string
}) => {
  return (
    <div className="  flex">
      <p>{userId}</p>
      <p>{name}</p>
    </div>
  )
}

export default UserLabel
