import { useEffect, useState } from "react";
import HeadTypography from "../components/HeadTypography"
import { useFeaturesState } from "../stores"
import { getAllFeatures } from "../config";
import CustomTable from "../components/CustomTable";
import FeatureById from "../components/FeatureById";

const Features = () => {

  const features = useFeaturesState((state:any) => state.features);
  const setFeatures = useFeaturesState((state:any) => state.setFeatures);
  const [openFeatureDialog, setOpenFeatureDialog] = useState(false);
  const [editingFeature, setEditingFeature] = useState<iFeature | null>(null);
  const [loader, setLoader] = useState(false);

  const buttons = [
    {
      label: <span>Add Feature</span>,
      onClick: () => {
        setEditingFeature(null);
        setOpenFeatureDialog(true);
      }
    }
  ];

  const columns = [
    {
      id: 'index',
      label: '#',
      render: (_row: iFeature, index: number) => {
          return index + 1
        },
    },
    {
      id: 'id',
      label: 'ID',
      render: (_row: iFeature) =>{
        return _row._id
      },
    },
    {
      id: 'name',
      label: 'Name',
      render: (_row: iFeature) =>{
        return _row.name
      },
    },
    {
      id: 'description',
      label: 'Description',
      render: (_row: iFeature) =>{
        return _row.description
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      render: (_row: iFeature) =>{
        return (
          <>
            <button className="text-blue-500 hover:underline">Edit</button>
            <button className="text-red-500 hover:underline ml-4">Delete</button>
          </>
        )
      },
    }
  ];
  
  const fetchFeatures = async () => {
    try {
      setLoader(true);
      const { data } = await getAllFeatures();
      const { success, features } = data as { success:boolean; features: iFeature[] };
      if (success) {
        setFeatures(features);
      }
    } catch (error) {
      console.error('Failed to fetch features', error);
    }finally{
      setLoader(false);
    }
  };

  const handleFeatureSubmit = async (data: { name: string; description: string }, id?: string) => {
    try{
      setLoader(true);
      if(id){
        // Call update API
      }else{
        // Call create API
      }
      fetchFeatures();
    }catch(error){
      console.error('Error submitting feature:', error);
    }finally{
      setLoader(false);
      setOpenFeatureDialog(false);
      setEditingFeature(null);
    }
  }

  useEffect(() => {
    fetchFeatures();
  }, []);

  return (
    <div>
      <HeadTypography title="FEATURES" buttons={buttons}/>
      <CustomTable 
        columns={columns} 
        data={features || []} 
        rowKey="_id" 
        emptyMessage="No features found" 
        stickyHeader 
      />
      <FeatureById 
        open={openFeatureDialog} 
        onClose={() => {
          setOpenFeatureDialog(false);
          setEditingFeature(null);
        }} 
        onSubmit={handleFeatureSubmit} feature={editingFeature} />
    </div>
  )
}

export default Features