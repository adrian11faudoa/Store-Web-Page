import * as categoryService from '../services/category.service.js'

export async function listCategories(req, res) {
  const [categories, ageGroups] = await Promise.all([
    categoryService.listCategories(),
    categoryService.listAgeGroups(),
  ])

  res.json({ data: { categories, ageGroups } })
}
