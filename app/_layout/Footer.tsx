"use client";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLinkedin,
  faInstagram,
  faGithub,
  faYoutube,
  faSquareXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-regular-svg-icons";

function getCurrentYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
      <div className="flex flex-row w-full text-xs text-gray-400 px-6">
        <div className="flex-col">
          <div>Copyright © {getCurrentYear()} Max Geller</div>
        </div>
        
        <span className="flex-grow"></span>
        <div className="social ">
          <ul>
            <li className="mr-[15px] inline-block">
              <a
                href="http://www.instagram.com/maxgeller"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="svg inline-block"
                  style={{ color: "gray-100", fontSize: 20 }}
                />
              </a>
            </li>
            <li className="mr-[15px] inline-block">
              <a
                href="http://www.youtube.com/@devmax617"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faYoutube}
                  className="svg inline-block"
                  style={{ color: "gray", fontSize: 20 }}
                />
              </a>
            </li>
            <li className="mr-[15px] inline-block">
              <a
                href="http://www.github.com/max-geller"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className="svg inline-block"
                  style={{ color: "gray", fontSize: 20 }}
                />
              </a>
            </li>
            <li className="mr-[15px] inline-block">
              <a href="mailto:info@maxgeller.com">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="svg inline-block"
                  style={{ color: "gray", fontSize: 20 }}
                />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
