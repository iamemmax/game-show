import React, { useState } from 'react';
import { Globe, Instagram, MessageCircle, Facebook, Twitter, LucideProps } from 'lucide-react';

interface contestantsProp{
    id: number;
    name: string;
    title: string;
    description: string;
    image: string;
    socialHandles: {
        icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
        username: string;
        color: string;
        hoverColor: string;
        url: string;
    }[];
}
export default function ContestantProfileCards() {
  const contestants = [
    {
      id: 1,
      name: "Preye Williams",
      title: "Digital Marketing",
      description: "I help small businesses grow online by crafting campaigns that convert and tell powerful brand stories",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23ec4899'/%3E%3Cpath d='M25 75 Q25 55 50 55 Q75 55 75 75 Z' fill='%23ec4899'/%3E%3C/svg%3E",
      socialHandles: [
        { icon: Globe, username: 'preyewilliams.com', color: 'text-blue-400', hoverColor: 'hover:text-blue-300', url: '#' },
        { icon: Instagram, username: '@preyewilliams', color: 'text-orange-400', hoverColor: 'hover:text-orange-300', url: '#' },
        { icon: MessageCircle, username: '@preyewilliams', color: 'text-red-400', hoverColor: 'hover:text-red-300', url: '#' },
        { icon: Facebook, username: 'Preye Williams', color: 'text-blue-500', hoverColor: 'hover:text-blue-400', url: '#' },
        { icon: Twitter, username: '@preyewilliams', color: 'text-gray-300', hoverColor: 'hover:text-white', url: '#' }
      ]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      title: "Content Creator",
      description: "Creating engaging content that resonates with audiences and drives meaningful connections for brands",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%2306b6d4'/%3E%3Cpath d='M25 75 Q25 55 50 55 Q75 55 75 75 Z' fill='%2306b6d4'/%3E%3C/svg%3E",
      socialHandles: [
        { icon: Globe, username: 'sarahjohnson.com', color: 'text-blue-400', hoverColor: 'hover:text-blue-300', url: '#' },
        { icon: Instagram, username: '@sarahj_creates', color: 'text-orange-400', hoverColor: 'hover:text-orange-300', url: '#' },
        { icon: MessageCircle, username: '@sarahcontent', color: 'text-red-400', hoverColor: 'hover:text-red-300', url: '#' },
        { icon: Facebook, username: 'Sarah Johnson', color: 'text-blue-500', hoverColor: 'hover:text-blue-400', url: '#' },
        { icon: Twitter, username: '@sarahj_creates', color: 'text-gray-300', hoverColor: 'hover:text-white', url: '#' }
      ]
    },
    {
      id: 3,
      name: "Michael Chen",
      title: "Brand Strategist",
      description: "Developing comprehensive brand strategies that elevate businesses and create lasting market impact",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%2310b981'/%3E%3Cpath d='M25 75 Q25 55 50 55 Q75 55 75 75 Z' fill='%2310b981'/%3E%3C/svg%3E",
      socialHandles: [
        { icon: Globe, username: 'michaelchen.co', color: 'text-blue-400', hoverColor: 'hover:text-blue-300', url: '#' },
        { icon: Instagram, username: '@michael_brands', color: 'text-orange-400', hoverColor: 'hover:text-orange-300', url: '#' },
        { icon: MessageCircle, username: '@mikechenbrands', color: 'text-red-400', hoverColor: 'hover:text-red-300', url: '#' },
        { icon: Facebook, username: 'Michael Chen', color: 'text-blue-500', hoverColor: 'hover:text-blue-400', url: '#' },
        { icon: Twitter, username: '@michael_brands', color: 'text-gray-300', hoverColor: 'hover:text-white', url: '#' }
      ]
    },
    {
      id: 4,
      name: "Emma Rodriguez",
      title: "Social Media Manager",
      description: "Managing social media presence that builds communities and drives engagement across all platforms",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23f59e0b'/%3E%3Cpath d='M25 75 Q25 55 50 55 Q75 55 75 75 Z' fill='%23f59e0b'/%3E%3C/svg%3E",
      socialHandles: [
        { icon: Globe, username: 'emmarodriguez.net', color: 'text-blue-400', hoverColor: 'hover:text-blue-300', url: '#' },
        { icon: Instagram, username: '@emma_socialmgr', color: 'text-orange-400', hoverColor: 'hover:text-orange-300', url: '#' },
        { icon: MessageCircle, username: '@emmasocial', color: 'text-red-400', hoverColor: 'hover:text-red-300', url: '#' },
        { icon: Facebook, username: 'Emma Rodriguez', color: 'text-blue-500', hoverColor: 'hover:text-blue-400', url: '#' },
        { icon: Twitter, username: '@emma_socialmgr', color: 'text-gray-300', hoverColor: 'hover:text-white', url: '#' }
      ]
    },
    {
      id: 5,
      name: "David Thompson",
      title: "SEO Specialist",
      description: "Optimizing websites and content to achieve top search engine rankings and drive organic traffic",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%238b5cf6'/%3E%3Cpath d='M25 75 Q25 55 50 55 Q75 55 75 75 Z' fill='%238b5cf6'/%3E%3C/svg%3E",
      socialHandles: [
        { icon: Globe, username: 'davidthompson.seo', color: 'text-blue-400', hoverColor: 'hover:text-blue-300', url: '#' },
        { icon: Instagram, username: '@david_seo', color: 'text-orange-400', hoverColor: 'hover:text-orange-300', url: '#' },
        { icon: MessageCircle, username: '@davidseo', color: 'text-red-400', hoverColor: 'hover:text-red-300', url: '#' },
        { icon: Facebook, username: 'David Thompson', color: 'text-blue-500', hoverColor: 'hover:text-blue-400', url: '#' },
        { icon: Twitter, username: '@david_seo', color: 'text-gray-300', hoverColor: 'hover:text-white', url: '#' }
      ]
    },
    {
      id: 6,
      name: "Lisa Park",
      title: "Email Marketing Expert",
      description: "Crafting email campaigns that nurture leads, retain customers, and maximize conversion rates",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f3f4f6'/%3E%3Ccircle cx='50' cy='35' r='15' fill='%23ef4444'/%3E%3Cpath d='M25 75 Q25 55 50 55 Q75 55 75 75 Z' fill='%23ef4444'/%3E%3C/svg%3E",
      socialHandles: [
        { icon: Globe, username: 'lisapark.email', color: 'text-blue-400', hoverColor: 'hover:text-blue-300', url: '#' },
        { icon: Instagram, username: '@lisa_emailpro', color: 'text-orange-400', hoverColor: 'hover:text-orange-300', url: '#' },
        { icon: MessageCircle, username: '@lisaemail', color: 'text-red-400', hoverColor: 'hover:text-red-300', url: '#' },
        { icon: Facebook, username: 'Lisa Park', color: 'text-blue-500', hoverColor: 'hover:text-blue-400', url: '#' },
        { icon: Twitter, username: '@lisa_emailpro', color: 'text-gray-300', hoverColor: 'hover:text-white', url: '#' }
      ]
    }
  ];

  const ContestantCard = ({ contestant:contestant }: {contestant:contestantsProp}) => (
    <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
      {/* Header with Profile Image and Name */}
      <div className="flex items-center gap-4 mb-6">
        {/* Profile Image */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white flex-shrink-0">
          <img 
            src={contestant.image}
            alt={contestant.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Name */}
        <div>
          <h2 className="text-white text-2xl font-bold leading-tight">
            {contestant.name.split(' ')[0]}<br />{contestant.name.split(' ')[1]}
          </h2>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <p className="text-purple-300 text-lg font-medium">
          {contestant.title}
        </p>
      </div>

      {/* Description */}
      <p className="text-white text-base leading-relaxed mb-8">
        {contestant.description}
      </p>

      {/* Social Media Handles - Two per row */}
      <div className="grid grid-cols-2 gap-4">
        {contestant.socialHandles.map((social:any, index:number) => {
          const IconComponent = social.icon;
          const socialKey = `${contestant.id}-${index}`;
          return (
            <a
              key={socialKey}
              href={social.url}
              className={`flex items-center gap-2 transition-all duration-300 ${social.hoverColor} group`}
            //   onMouseEnter={() => setHoveredSocial(socialKey)}
            //   onMouseLeave={() => setHoveredSocial(null)}
            >
              <IconComponent className={`${social.color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`} size={18} />
              <span className={`${social.color} font-medium group-hover:translate-x-1 transition-transform duration-300 text-sm truncate`}>
                {social.username}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Featured Contestants</h1>
          <p className="text-gray-400 text-lg">Showcasing our top digital marketing talent</p>
        </div>
        
        {/* Contestant Cards Grid - Two per page */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {contestants.slice(0, 6).map((contestant) => (
            <ContestantCard key={contestant.id} contestant={contestant} />
          ))}
        </div>
      </div>
    </div>
  );
}