import { useEffect, useState } from "react";
import CustomTable from "../components/CustomTable";
import HeadTypography from "../components/HeadTypography";
import ProductById from "../components/ProductById";
import { useProductsState } from "../stores";
import { createProduct, deleteProduct, getAllProducts, updateProduct } from "../config";
import Loader from "../components/Loader";

const Products = () => {
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<iProduct | null>(null);
  const [loader, setLoader] = useState(false);

  const { products, setProducts } = useProductsState((state: any) => state);

  const buttons = [
    {
      label: <span>Add Product</span>,
      onClick: () => {
        setEditingProduct(null);
        setOpenProductDialog(true);
      },
    },
  ];

  const columns = [
    {
      id: "index",
      label: "#",
      render: (_row: iProduct, index: number) => {
        return index + 1;
      },
    },
    {
      id: "id",
      label: "ID",
      render: (_row: iProduct) => {
        return _row._id;
      },
    },
    {
      id: "name",
      label: "Name",
      render: (_row: iProduct) => {
        return _row.name;
      },
    },
    {
      id: "description",
      label: "Description",
      render: (_row: iProduct) => {
        return _row.description;
      },
    },
    {
      id: "actions",
      label: "Actions",
      render: (_row: iProduct) => {
        return (
          <>
            <button
              onClick={() => {
                setEditingProduct(_row);
                setOpenProductDialog(true);
              }}
              className="text-blue-500 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this product?",
                  )
                ) {
                  handleDeleteProduct(_row._id);
                }
              }}
              className="text-red-500 hover:underline ml-4"
            >
              Delete
            </button>
          </>
        );
      },
    },
  ];

  const fetchAllProducts = async () => {
    try {
      const { data } = await getAllProducts();

      const { success, products } = data as {
        success: boolean;
        products: iProduct[];
      };

      if (success) {
        setProducts(products);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoader(false);
    }
  };

  const handleProductSubmit = async (data: iProduct, id?: string) => {
    try {
      setLoader(true);
      if (id) {
        await updateProduct(id, data);
      } else {
        const { _id, ...createData } = data;
        await createProduct(createData);
      }
      fetchAllProducts();
    } catch (error) {
      console.error("Error submitting Product:", error);
    } finally {
      setLoader(false);
      setOpenProductDialog(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      setLoader(true);
      await deleteProduct(id);
      fetchAllProducts();
    } catch (error) {
      console.error("Error deleting Product:", error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <div>
      <Loader open={loader} />
      <HeadTypography title="PRODUCTS" buttons={buttons} />
      <CustomTable
        columns={columns}
        data={products || []}
        rowKey="_id"
        emptyMessage="No products found"
        stickyHeader
      />
      <ProductById
        open={openProductDialog}
        onClose={() => setOpenProductDialog(false)}
        onSubmit={handleProductSubmit}
        product={editingProduct}
      />
    </div>
  );
};

export default Products;
