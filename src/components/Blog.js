import { Fragment, useState } from "react";
import Image from "next/image";
import BlogPopup from "./popup/BlogPopup";
import {
  BLOG_THUMBNAIL_PLACEHOLDER,
  blogData,
  blogIntro,
  sectionIds,
  wowDelay,
} from "../constants";

const Blog = () => {
  const [activeData, setActiveData] = useState({});
  const [open, setOpen] = useState(false);
  const onClick = (e, blog) => {
    e.preventDefault();
    setOpen(true);
    setActiveData(blog);
  };
  return (
    <Fragment>
      <BlogPopup open={open} close={() => setOpen(false)} data={activeData} />
      <div className="devman_tm_section" id={sectionIds.blog}>
        <div className="devman_tm_news">
          <div className="container">
            <div className="devman_tm_main_title" data-text-align="center">
              <span>{blogIntro.eyebrow}</span>
              <h3>{blogIntro.heading}</h3>
              <p>{blogIntro.description}</p>
            </div>
            <div className="news_list">
              <ul>
                {blogData.map((blog, i) => (
                  <li
                    key={i}
                    className="wow fadeInUp"
                    data-wow-duration="1s"
                    data-wow-delay={wowDelay(i)}
                  >
                    <div className="list_inner">
                      <div className="image">
                        <Image
                          src={BLOG_THUMBNAIL_PLACEHOLDER}
                          alt=""
                          width={400}
                          height={300}
                        />
                        <div className="main" data-img-url={blog.img} />
                        <a
                          className="devman_tm_full_link"
                          href="#"
                          onClick={(e) => onClick(e, blog)}
                        />
                      </div>
                      <div className="details">
                        <span className="category">
                          <a href="#" onClick={(e) => onClick(e, blog)}>
                            {blog.category}
                          </a>
                        </span>
                        <h3 className="title">
                          <a href="#" onClick={(e) => onClick(e, blog)}>
                            {blog.title}
                          </a>
                        </h3>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
export default Blog;
