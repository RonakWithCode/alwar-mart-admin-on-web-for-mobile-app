import { collection, getDocs, setDoc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { doc } from 'firebase/firestore';  // Add this separate import for doc
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Product from '@/models/Product';

export class ProductService {
  // Helper function to generate a unique product ID
  static generateProductId() {
    const timestamp = Date.now().toString(36); // Convert timestamp to base36
    const randomStr = Math.random().toString(36).substring(2, 7); // 5 random chars
    return `PRD${timestamp}${randomStr}`.toUpperCase();
  }

  static async getAllProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'Product'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async createProduct(productData, imageFiles) {
    try {
      const productImages = [];
      
      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const storageRef = ref(storage, `product-images/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          const imageUrl = await getDownloadURL(storageRef);
          productImages.push(imageUrl);
        }
      }

      // Generate a unique product ID
      const generatedId = this.generateProductId();
      
      // Process the data
      const processedData = {
        ...productData,
        productId: generatedId,
        price: Number(productData.price) || 0,
        mrp: Number(productData.mrp) || 0,
        purchasePrice: Number(productData.purchasePrice) || 0,
        discount: Number(productData.discount) || 0,
        stockCount: Number(productData.stockCount) || 0,
        minSelectableQuantity: Number(productData.minSelectableQuantity) || 1,
        maxSelectableQuantity: Number(productData.maxSelectableQuantity) || 1,
        selectableQuantity: Number(productData.selectableQuantity) || 1,
        productImage: productImages,
        keywords: Array.isArray(productData.keywords) ? productData.keywords : 
                 (typeof productData.keywords === 'string' ? 
                   productData.keywords.split(',').map(k => k.trim()) : []),
        variations: Array.isArray(productData.variations) ? productData.variations : []
      };

      // Create new Product instance
      const product = new Product(processedData);

      // Create document with generated ID in 'products' collection
      const productRef = doc(db, 'Product', generatedId);
      
      // Save to Firestore
      await setDoc(productRef, {
        ...product.toFirestore(),
        createdAt: new Date().toISOString()
      });

      return {
        id: generatedId,
        productId: generatedId,
        ...product.toFirestore()
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  static async updateProduct(productId, productData, imageFiles, currentImages) {
    try {
      const productDocRef = doc(db, 'Product', productId);
      let productImages = [...(currentImages || [])];

      // Handle new image uploads
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const storageRef = ref(storage, `product/${Date.now()}${file.name}`);
          await uploadBytes(storageRef, file);
          const imageUrl = await getDownloadURL(storageRef);
          productImages.push(imageUrl);
        }
      }

      // Convert form data to proper types
      const processedData = {
        ...productData,
        price: Number(productData.price) || 0,
        mrp: Number(productData.mrp) || 0,
        purchasePrice: Number(productData.purchasePrice) || 0,
        discount: Number(productData.discount) || 0,
        stockCount: Number(productData.stockCount) || 0,
        minSelectableQuantity: Number(productData.minSelectableQuantity) || 1,
        maxSelectableQuantity: Number(productData.maxSelectableQuantity) || 1,
        selectableQuantity: Number(productData.selectableQuantity) || 1,
        productImage: productImages,
        keywords: typeof productData.keywords === 'string' 
          ? productData.keywords.split(',').map(k => k.trim())
          : (Array.isArray(productData.keywords) ? productData.keywords : []),
        variations: Array.isArray(productData.variations) ? productData.variations : []
      };

      // Create new Product instance
      const product = new Product(processedData);

      // Update in Firestore
      await updateDoc(productDocRef, product.toFirestore());

      // Return updated product
      return {
        id: productId,
        ...product.toFirestore()
      };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  static async deleteProduct(productId, productImages) {
    try {
      const productDocRef = doc(db, 'Product', productId);
      // Delete all images from storage
      if (productImages && productImages.length > 0) {
        for (const imageUrl of productImages) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
          } catch (error) {
            console.error('Error deleting product image:', error);
          }
        }
      }

      await deleteDoc(productDocRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  static async getProductById(productId) {
    try {
      const productDocRef = doc(db, 'Product', productId);
      const productDoc = await getDoc(productDocRef);
      
      if (!productDoc.exists()) {
        console.log('Product document does not exist');
        throw new Error('Product not found');
      }
      
      const data = productDoc.data();
      console.log('Raw Firebase Data:', data);
      console.log('Product Model Fields:', Object.keys(new Product()));
      console.log('Firebase Fields:', Object.keys(data));
      
      // Compare field names
      const modelFields = Object.keys(new Product());
      const firebaseFields = Object.keys(data);
      
      const mismatches = modelFields.filter(field => 
        !firebaseFields.includes(field) || 
        typeof data[field] !== typeof new Product()[field]
      );
      
      if (mismatches.length > 0) {
        console.log('Field mismatches found:', mismatches);
        console.log('Field types in Firebase:', mismatches.map(field => ({
          field,
          firebaseType: typeof data[field],
          modelType: typeof new Product()[field]
        })));
      }

      return {
        id: productDoc.id,
        ...data
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }
  }

  // static async deleteProductsByCategory(categoryName) {
  //   try {
  //     // Get all products
  //     const querySnapshot = await getDocs(collection(db, 'Product'));
  //     const deletePromises = [];

  //     // Filter and delete products with matching category
  //     for (const docSnapshot of querySnapshot.docs) {
  //       const productData = docSnapshot.data();
  //       if (productData.category === categoryName) {
  //         // Delete product images from storage if they exist
  //         if (productData.productImage && productData.productImage.length > 0) {
  //           for (const imageUrl of productData.productImage) {
  //             try {
  //               const imageRef = ref(storage, imageUrl);
  //               deletePromises.push(deleteObject(imageRef));
  //             } catch (error) {
  //               console.error('Error deleting product image:', error);
  //             }
  //           }
  //         }
  //         // Delete the product document
  //         const productRef = doc(db, 'Product', docSnapshot.id);
  //         deletePromises.push(deleteDoc(productRef));
  //       }
  //     }

  //     // Wait for all deletions to complete
  //     await Promise.all(deletePromises);
      
  //     console.log(`Successfully deleted all products in category: ${categoryName}`);
  //   } catch (error) {
  //     console.error('Error deleting products by category:', error);
  //     throw new Error(`Failed to delete products in category: ${error.message}`);
  //   }
  // }

} 

// await ProductService.deleteProductsByCategory('Soaps & Body Care');