import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import Product from '@/models/Product';

export class ProductService {
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
      
      // Upload multiple images
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

      const product = new Product(processedData);
      const productRef = await addDoc(collection(db, 'Product' ,product.productId), product.toFirestore());
      
      return {
        id: productRef.id,
        ...product.toFirestore()
      };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  static async updateProduct(productId, productData, imageFiles, currentImages) {
    try {
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
      await updateDoc(doc(db, 'Product', productId), product.toFirestore());

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

      await deleteDoc(doc(db, 'Product', productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  static async getProductById(productId) {
    try {
      console.log('Attempting to fetch product with ID:', productId);
      
      const productDoc = await getDoc(doc(db, 'Product', productId));
      
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


} 