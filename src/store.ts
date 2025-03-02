import { proxy } from 'valtio'

const state = proxy({
  intro: true,
  wardrobeModels: ['wardrobe1', 'wardrobe2', 'wardrobe3'], // You can add more models here
  selectedModel: 'wardrobe1',
  mountedWardrobes: [] as { wall: string; position: [number, number, number]; rotation: [number, number, number]; model: string }[]
})

export { state }
