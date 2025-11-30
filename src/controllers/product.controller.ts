import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Category } from '../entities/Category';
import { Product } from '../entities/Product';

const productRepo = AppDataSource.getRepository(Product);
const categoryRepo = AppDataSource.getRepository(Category);

export const getAllProducts = async (req: Request, res: Response) => {
  const products = await productRepo.find({ relations: ['category'] });
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await productRepo.findOne({
    where: { id: req.params.id },
    relations: ['category'],
  });
  if (!product) return res.status(404).json({ message: 'product not found .' });

  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const { title, description, price, stock, imageUrl, categoryId } = req.body;

  let category: Category | null = null;
  if (categoryId) {
    category = await categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ message: 'category not found .' });
  }

  const product = productRepo.create({
    title,
    description,
    price,
    stock,
    imageUrl,
    ...(category && { category }),
  });

  await productRepo.save(product);
  res.status(201).json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await productRepo.findOne({
    where: { id: req.params.id },
    relations: ['category'],
  });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { categoryId, ...rest } = req.body;

  if (categoryId) {
    const category = await categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ message: 'Category not found' });
    product.category = category;
  }

  productRepo.merge(product, rest);
  await productRepo.save(product);
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = await productRepo.findOne({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await productRepo.remove(product);
  res.json({ message: 'Product deleted' });
};
