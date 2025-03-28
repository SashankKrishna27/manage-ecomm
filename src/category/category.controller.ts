import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Controller,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Creates a new category
   * POST /v1/category
   * @param createCategoryDto - Data transfer object containing category details
   * @returns Newly created category
   */
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Retrieves all categories in a tree structure
   * GET /v1/category/tree
   * @returns Hierarchical tree structure of all active categories
   */
  @Get('tree')
  find() {
    return this.categoryService.find();
  }

  /**
   * Updates an existing category
   * PATCH /v1/category/:id
   * @param id - ID of the category to update
   * @param updateCategoryDto - Data transfer object containing update details
   * @returns Updated category
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Soft deletes a category by marking it as inactive
   * DELETE /v1/category/:id
   * @param id - ID of the category to soft delete
   * @returns Updated category with isActive set to false
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  /**
   * Permanently deletes a category from the database
   * DELETE /v1/category/permanent/:id
   * @param id - ID of the category to permanently delete
   * @returns Deletion status and response
   */
  @Delete('permanent/:id')
  permanentRemove(@Param('id') id: string) {
    return this.categoryService.permanentRemove(id);
  }
}
