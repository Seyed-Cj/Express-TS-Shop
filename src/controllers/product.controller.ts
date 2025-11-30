import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { z } from 'zod';

const productRepo = AppDataSource.getRepository(Product);
const categoryRepo = AppDataSource.getRepository(Category);

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
});

const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().uuid().optional(),
});

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const categoryId = req.query.category as string | undefined;

    const qb = productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    if (search) {
      qb.andWhere('(product.title ILIKE :q OR product.description ILIKE :q)', {
        q: `%${search}%`,
      });
    }
    if (categoryId) {
      qb.andWhere('category.id = :cat', { cat: categoryId });
    }

    const [items, total] = await qb
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return res.json({
      data: items,
      meta: { total, page, limit },
    });
  } catch (err) {
    console.error('getAllProducts error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await productRepo.findOne({
      where: { id: req.params.id, isActive: true },
      relations: ['category'],
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    return res.json(product);
  } catch (err) {
    console.error('getProductById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const parse = createProductSchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ message: 'Validation failed', errors: parse.error.issues });

    const { title, description, price, stock, imageUrl, categoryId } = parse.data;

    let category: Category | null = null;
    if (categoryId) {
      category = await categoryRepo.findOne({ where: { id: categoryId } });
      if (!category) return res.status(400).json({ message: 'Category not found' });
    }

    const product = productRepo.create({
      title,
      description,
      price,
      stock,
      imageUrl,
      category: category ?? undefined,
    } as Partial<Product>);

    await productRepo.save(product);
    res.status(201).location(`/api/products/${product.id}`).json(product);
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const parse = updateProductSchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ message: 'Validation failed', errors: parse.error.issues });

    const product = await productRepo.findOne({
      where: { id: req.params.id },
      relations: ['category'],
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { categoryId, ...rest } = parse.data;

    if (categoryId) {
      const category = await categoryRepo.findOne({ where: { id: categoryId } });
      if (!category) return res.status(400).json({ message: 'Category not found' });
      product.category = category;
    }

    const allowed = ['title', 'description', 'price', 'stock', 'imageUrl', 'isActive'] as const;
    (allowed as readonly string[]).forEach((k) => {
      if ((rest as any)[k] !== undefined) (product as any)[k] = (rest as any)[k];
    });

    await productRepo.save(product);
    return res.json(product);
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await productRepo.findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isActive = false;
    await productRepo.save(product);

    return res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
