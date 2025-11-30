import z from "zod";
import { Category } from "../entities/Category";
import { AppDataSource } from "../config/data-source";
import { Request, Response } from "express";

const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
});

const updateCategorySchema = createCategorySchema.partial();

const categoryRepo = AppDataSource.getRepository(Category);

export const getAllCategories = async (_: Request, res: Response) => {
  try {
    const categories = await categoryRepo.find({ relations: ['products'] });
    res.json(categories);
  } catch (err) {
    console.error('getAllCategories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await categoryRepo.findOne({
      where: { id: req.params.id },
      relations: ['products'],
    });

    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json(category);
  } catch (err) {
    console.error('getCategoryById error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const parse = createCategorySchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ errors: parse.error.issues });

    const exists = await categoryRepo.findOne({ where: { name: parse.data.name } });
    if (exists) return res.status(409).json({ message: 'Category already exists' });

    const category = categoryRepo.create(parse.data);
    await categoryRepo.save(category);
    res.status(201).json(category);
  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const parse = updateCategorySchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ errors: parse.error.issues });

    const category = await categoryRepo.findOne({ where: { id: req.params.id } });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    categoryRepo.merge(category, parse.data);
    await categoryRepo.save(category);
    res.json(category);
  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryRepo.findOne({
      where: { id: req.params.id },
      relations: ['products'],
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    if (category.products.length > 0)
      return res.status(400).json({ message: 'Category has products' });

    await categoryRepo.remove(category);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};