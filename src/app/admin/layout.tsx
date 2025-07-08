import React from 'react'
import Logo from '../icons/Logo'

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className=' bg-[#1a0b25] text-white bg-[url("/images/host-bg.png")] bg-no-repeat bg-contain bg-center mx-auto h-dvh overflow-hidden'>
            <header className='h-10 flex items-center justify-between px-8 py-2 container mx-auto my-3'>
                <Logo width={80} />
            </header>
            <main className='w-full h-[calc(100dvh-2.5rem)] overflow-y-scroll pb-5'>
                <div className='container mx-auto h-full rounded-lg shadow-lg'>
                    {children}
                </div>
            </main>
        </div>
    )
}

export default AdminLayout