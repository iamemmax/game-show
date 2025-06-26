import React from 'react'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='bg-[#1a0b25] text-white bg-[url("/images/host-bg.png")] bg-no-repeat bg-contain bg-center mx-auto h-dvh overflow-y-hidden'>
            <header className='h-10 flex items-center justify-between mb-5'>

            </header>
            <main className='container mx-auto min-h-[calc(100dvh-2.5rem)] px-4 py-6 overflow-y-auto '>
                {children}
            </main>
        </div>
    )
}

export default AdminLayout