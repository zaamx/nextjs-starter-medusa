import { NextRequest, NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const tags = searchParams.get("tags") as string

  if (!tags) {
    return NextResponse.json({ error: "No tags provided" }, { status: 400 })
  }

  const tagsArray = tags.split(",")
  
  try {
    await Promise.all(
      tagsArray.map(async (tag) => {
        switch (tag) {
          case "products":
            revalidatePath("/[countryCode]/(main)/store", "page")
            revalidatePath("/[countryCode]/(main)/products/[handle]", "page")
            revalidatePath("/[countryCode]/(main)/collections/[handle]", "page")
            revalidatePath("/[countryCode]/(main)/categories/[...category]", "page")
            revalidatePath("/[countryCode]/(main)/page", "page")
            break
          case "collections":
            revalidatePath("/[countryCode]/(main)/collections/[handle]", "page")
            revalidatePath("/[countryCode]/(main)/store", "page")
            break
          case "categories":
            revalidatePath("/[countryCode]/(main)/categories/[...category]", "page")
            revalidatePath("/[countryCode]/(main)/store", "page")
            break
          case "customers":
            revalidatePath("/[countryCode]/(main)/account", "page")
            revalidatePath("/[countryCode]/(main)/account/@dashboard", "page")
            break
          case "carts":
            revalidatePath("/[countryCode]/(main)/cart", "page")
            break
          case "orders":
            revalidatePath("/[countryCode]/(main)/account/@dashboard/orders", "page")
            revalidatePath("/[countryCode]/(main)/account/@dashboard/orders/details/[id]", "page")
            break
          default:
            // If it's a specific product ID, revalidate that product's page
            if (tag.startsWith("product-")) {
              const productId = tag.replace("product-", "")
              revalidatePath(`/[countryCode]/(main)/products/[handle]`, "page")
            }
            // If it's a specific collection ID, revalidate that collection's page
            else if (tag.startsWith("collection-")) {
              const collectionId = tag.replace("collection-", "")
              revalidatePath(`/[countryCode]/(main)/collections/[handle]`, "page")
            }
            // If it's a specific category ID, revalidate that category's page
            else if (tag.startsWith("category-")) {
              const categoryId = tag.replace("category-", "")
              revalidatePath(`/[countryCode]/(main)/categories/[...category]`, "page")
            }
            break
        }
      })
    )

    return NextResponse.json({ 
      message: "Cache revalidated successfully", 
      revalidatedTags: tagsArray 
    }, { status: 200 })
  } catch (error) {
    console.error("Cache revalidation error:", error)
    return NextResponse.json({ 
      error: "Failed to revalidate cache" 
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tags, paths } = body

    if (!tags && !paths) {
      return NextResponse.json({ 
        error: "No tags or paths provided" 
      }, { status: 400 })
    }

    // Revalidate by tags
    if (tags && Array.isArray(tags)) {
      await Promise.all(
        tags.map((tag: string) => revalidateTag(tag))
      )
    }

    // Revalidate by paths
    if (paths && Array.isArray(paths)) {
      await Promise.all(
        paths.map((path: string) => revalidatePath(path, "page"))
      )
    }

    return NextResponse.json({ 
      message: "Cache revalidated successfully",
      revalidatedTags: tags || [],
      revalidatedPaths: paths || []
    }, { status: 200 })
  } catch (error) {
    console.error("Cache revalidation error:", error)
    return NextResponse.json({ 
      error: "Failed to revalidate cache" 
    }, { status: 500 })
  }
} 