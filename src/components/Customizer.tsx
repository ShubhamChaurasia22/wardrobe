import React from 'react'
import { useSnapshot } from 'valtio'
import { state } from '../store'

const Customizer: React.FC = () => {
  const snap = useSnapshot(state)

  return (
    <div className="customizer">
      <div className="wardrobe-options">
        {snap.wardrobeModels.map((model: string) => (
          <div
            key={model}
            className={`wardrobe-option ${snap.selectedModel === model ? 'selected' : ''}`}
            onClick={() => (state.selectedModel = model)}
          >
            <img src={`/wardrobes/${model}_thumb.png`} alt={model} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Customizer
