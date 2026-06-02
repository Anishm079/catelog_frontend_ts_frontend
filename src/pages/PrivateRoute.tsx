import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useUserState } from '../stores'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { verifyAuthToken } from '../config'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const userDetails = useUserState((state:any) => state.userDetails)
  const setUserDetails = useUserState((state:any) => state.setUserDetails)
  const navigate = useNavigate()

      const fetchUserDetails = async () => {
        try{
            const { data } = await verifyAuthToken(); // Example API call
    
            const { success, user } = data as { success: boolean, user: iUser };
    
            if(success){
                setUserDetails(user);
            }
        }catch(error){
            console.error('Error fetching user details:', error);
        }finally{
            
        }
        // Implement logic to fetch user details from API or local storage

    };

  useEffect(() => {
    if (!userDetails) {
      navigate('/login',{
        state: { from: -1 }
      })
    }
  }, [userDetails, navigate])

  useEffect(() => {
    if(!userDetails){
      fetchUserDetails();
    }
  }, [])

  if (!userDetails) {
    return null
  }

  return (
    <>
      <Navbar />
      <main className="text-white min-h-[calc(100vh-7.55rem)] bg-slate-900 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default PrivateRoute;
