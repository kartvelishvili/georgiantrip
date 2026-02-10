// Re-exporting or wrapping the component we already have, but ensuring it matches structure
import MyProfile from '@/components/driver/MyProfile';

const DriverProfile = () => {
  return <MyProfile />;
};

export default DriverProfile;