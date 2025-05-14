import React from 'react'

const Loader = () => {
  return (
    <div className="flex-1 flex px-3 h-full flex-col justify-center items-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
</div>
  )
}

export default Loader