"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "What is ProveNode?",
    answer: "ProveNode is a platform that turns your images into verifiable digital assets. We use blockchain and invisible watermarking to ensure you can always prove who owns an image and where it came from."
  },
  {
    question: "How does the 'Invisible DNA' tracking work?",
    answer: "We embed a hidden watermark into the image pixels. Even if someone takes a screenshot or makes edits that change the file's hash, this watermark stays intact and links the new version back to the original source."
  },
  {
    question: "What happens if my image is edited?",
    answer: "ProveNode detects the change in cryptographic hash but uses the invisible watermark to maintain the connection to the original 'root' image, keeping the entire lineage transparent."
  },
  {
    question: "Why is this called a Web 2.5 system?",
    answer: "It’s the best of both worlds. We use traditional databases for a fast user experience (Web 2), while using Ethereum and IPFS to make ownership records permanent and decentralized (Web 3)."
  },
  {
    question: "How do I transfer ownership of an image?",
    answer: "You can transfer the rights to your image through the dashboard. This update is recorded on the Ethereum blockchain, making the recipient the new verified owner."
  },
  {
    question: "Is my data stored permanently?",
    answer: "Yes. By using IPFS, your images are stored on a decentralized network rather than a single server, ensuring your assets are safe from being lost or deleted."
  }
];

export default function FAQ() {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <section className="bg-gray-900 py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left Side: Heading */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter leading-tight">
            Frequently asked <br /> questions
          </h2>
          <p className="mt-6 text-zinc-500 text-lg max-w-sm">
            Everything you need to know about the ProveNode ecosystem and image provenance.
          </p>
        </motion.div>

        {/* Right Side: Accordion */}
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-zinc-800/50">
              <button
                onClick={() => setActiveId(activeId === index ? null : index)}
                className="w-full flex items-center justify-between text-left py-6 focus:outline-none group"
              >
                <span className={`text-xl font-medium transition-colors duration-300 ${activeId === index ? 'text-cyan-400' : 'text-zinc-300 group-hover:text-white'}`}>
                  {faq.question}
                </span>
                <div className={`p-1 rounded-full transition-all duration-300 ${activeId === index ? 'bg-cyan-500/10 rotate-45' : 'bg-transparent'}`}>
                  <Plus 
                    className={`w-6 h-6 ${activeId === index ? 'text-cyan-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} 
                  />
                </div>
              </button>
              
              <AnimatePresence>
                {activeId === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <p className="text-zinc-400 text-lg leading-relaxed pb-8 pr-10">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}