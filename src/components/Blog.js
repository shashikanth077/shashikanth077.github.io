import { Fragment, useState } from "react";
import Image from "next/image";
import BlogPopup from "./popup/BlogPopup";
import { blogData } from "../constants";

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
      <div className="devman_tm_section" id="blog">
        <div className="devman_tm_news">
          <div className="container">
            <div className="devman_tm_main_title" data-text-align="center">
              <span>Latest News</span>
              <h3>Checkout My Recent Blogs</h3>
              <p>
                Dliquip ex ea commo do conse namber onequa ute irure dolor in
                reprehen derit in voluptate
              </p>
            </div>
            <div className="news_list">
              <ul>
                {blogData.map((blog, i) => (
                  <li
                    key={i}
                    className="wow fadeInUp"
                    data-wow-duration="1s"
                    data-wow-delay={`0.${i * 2}s`}
                  >
                    <div className="list_inner">
                      <div className="image">
                        <Image
                          src="/img/thumbs/42-29.jpg"
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
