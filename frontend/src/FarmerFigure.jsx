import React from 'react'

export default function FarmerFigure({caption}) {
  return <figure className="farmer-figure" aria-label={caption}>
    <svg viewBox="0 0 280 250" role="img" aria-hidden="true">
      <ellipse cx="143" cy="222" rx="83" ry="13" fill="#dfe8d8"/>
      <circle cx="142" cy="121" r="101" fill="#eaf0e5"/>
      <circle cx="142" cy="121" r="83" fill="none" stroke="#d5e0cf" strokeDasharray="3 6"/>
      <path d="M103 174c2-15 3-27 6-36l14-12 38 1 15 13 7 46-17 28h-52l-17-24z" fill="#52744b"/>
      <path d="M118 179l17 3 1 37h-22l-4-29zm28 3 18-5 10 31-4 12h-21z" fill="#d8d7c4"/>
      <path d="M112 211h24l1 10h-31c0-5 2-8 6-10zm38 0h22c7 1 10 4 10 9h-34z" fill="#574638"/>
      <path d="M109 143c-8 7-14 19-20 31l17 12 22-26zm55-1c8 6 16 15 24 26l-16 15-22-23z" fill="#52744b"/>
      <path d="M99 164c-6 8-11 17-15 25l9 8c8-8 15-16 19-25zm82 0c9 6 16 13 21 21l-8 9c-9-5-18-12-23-21z" fill="#bc8058"/>
      <path d="M123 104h35v24c-6 10-24 10-32 0z" fill="#b97e58"/>
      <ellipse cx="141" cy="82" rx="31" ry="35" fill="#c58a61"/>
      <path d="M111 78c2-24 13-38 31-39 19 0 31 14 32 38-8-6-14-12-19-20-11 10-26 17-44 21z" fill="#f4f0df"/>
      <path d="M111 70c7-18 19-27 33-27 14 0 25 8 31 24l-8 7c-11-2-20-8-26-17-8 8-17 14-29 17z" fill="#fbf8ec" stroke="#ded9c8" strokeWidth="2"/>
      <path d="M115 82c8-2 15-5 21-9m-20 14 9 1m24-1 8-1" fill="none" stroke="#4a392f" strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M133 97c5 3 11 3 16 0" fill="none" stroke="#704b3b" strokeWidth="2" strokeLinecap="round"/>
      <path d="M122 120c8 7 25 8 36 0l7 7-4 10c-15 8-28 8-42 0l-4-10z" fill="#f3efe2"/>
      <path d="M121 127l40 1" stroke="#d7d0bd" strokeWidth="2"/>
      <rect x="130" y="142" width="31" height="49" rx="5" fill="#33413a" stroke="#f4f4e9" strokeWidth="2" transform="rotate(-7 130 142)"/>
      <rect x="134" y="148" width="23" height="33" rx="2" fill="#eaf0e5" transform="rotate(-7 134 148)"/>
      <rect x="138" y="153" width="14" height="8" rx="2" fill="#d5e2cc" transform="rotate(-7 138 153)"/>
      <path d="M138 174l5-7 5 3 6-9" fill="none" stroke="#69885b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="145" cy="186" r="1.7" fill="#d9dfd3"/>
      <path d="M127 157c-4-1-7 1-8 5l-1 7c0 3 3 5 6 4l9-4zm36-2c4 0 6 3 6 6v8c0 3-3 5-6 4l-7-4z" fill="#c58a61"/>
      <path d="M77 74l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#b58b55" opacity=".8"/>
      <circle cx="213" cy="129" r="3" fill="#8ba17b"/>
      <circle cx="72" cy="151" r="2.5" fill="#a4b499"/>
    </svg>
    <figcaption><span className="farmer-caption-icon">✓</span>{caption}</figcaption>
  </figure>
}
