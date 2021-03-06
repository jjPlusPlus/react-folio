import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';

import { firebaseConnect, getVal } from 'react-redux-firebase';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Uploader from 'components/Uploader';
import CodeBlock from 'components/CodeBlock';
import Typer from 'components/Typer';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faTrashAlt, faCheck } from "@fortawesome/free-solid-svg-icons";

/* TODO: 
 * - posts/projects now have a listImage that is just the URL, and only one at a time
      - need a new section to add a list image; same drag and drop as before, but instead of adding to an array,
      - adds a 'listImage' to the post/proj record and fills it with the resulting DownloadURL
      - posts/projects will have a 'headerImage' field that is a DownloadURL 
 * - the post/project.images array is now for general image management, and needs to show downloadURL's
*/

class PostEditor extends Component {
  constructor(props) {
    super(props)
    const post = this.props.post;

    this.state = {
      name: "",
      snippet: "",
      content: "",
      isPublished: false,
      isFeatured: false,
      images: [],
      tags: [],
      newTag: "",
      stickyTopBar: false,
      showPreview: false,
    }

    this.updateResource = this.updateResource.bind(this);
  }

  componentDidMount() {
    window.addEventListener("scroll", () => {
      const isExpanded = this.state.stickyTopBar;
      if (window.scrollY > 90 && !isExpanded) {
        this.setState({ "stickyTopBar": true });
      }
      if (window.scrollY <= 90 && isExpanded) {
        this.setState({ "stickyTopBar": false });
      }
    })
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.props.post && nextProps.post) {
      // post was passed in successfully
      this.setState({
        name: nextProps.post.name,
        snippet: nextProps.post.snippet,
        content: nextProps.post.content,
        isPublished: nextProps.post.isPublished,
        isFeatured: nextProps.post.isFeatured,
        images: nextProps.post.images || [],
        tags: nextProps.post.tags || [],
        heroImage: nextProps.project.heroImage,
        listImage: nextProps.project.listImage
      })
    }
  }

  updateResource(event) {
    event.preventDefault();
    let { name, snippet, content, isPublished, isFeatured, listImage, heroImage } = this.state;
    name = name || "";
    snippet = snippet || "";
    content = content || "";
    isPublished = isPublished || false;
    isFeatured = isFeatured || false;
    listImage = listImage || null;
    heroImage = heroImage || null;
    this.props.firebase.update(`posts/${this.props.match.params.id}`, {
      name,
      snippet,
      content,
      isPublished,
      isFeatured,
      listImage,
      heroImage
    }).then(result => {
      alert("Update successful.")
    }).catch(error => {
      console.log(error);
      alert("There was a problem updating the article");
    });
  }

  inputChange = field => event => {
    this.setState({
      [field]: event.target.value
    })
  }

  checkboxChange = field => event => {
    this.setState({
      [field]: event.target.value
    })
  }

  handleTagCheckboxChange = name => (event) => {
    const isChecked = event.target.checked;
    const tagID = event.target.value;
    const postID = this.props.match.params.id;

    const postTags = this.state.tags; // all tags for this post
    const tagposts = this.props.tags[tagID].posts || []; // all posts for this tag

    if (isChecked) {
      postTags.push(tagID);
      tagposts.push(postID);
      // add this tag to the current post's tags array
      this.props.firebase.update(`posts/${postID}`, {
        tags: postTags,
      }).then(result => {
        // add this post to the current Tag's post array
        this.props.firebase.update(`tags/${tagID}`, {
          posts: tagposts,
        }).catch(error => {
          console.log(error);
          alert("The tag could not be updated");
        });
      }).catch(error => {
        console.log(error);
        alert("The tag could not be updated");
      });

    } else {
      postTags.splice(postTags.indexOf(tagID), 1);
      tagposts.splice(tagposts.indexOf(postID), 1);
      // remove this tag from the current post's tag array
      this.props.firebase.update(`posts/${postID}`, {
        tags: postTags,
      }).then(result => {
        // remove this post from the current Tag's post array
        this.props.firebase.update(`tags/${tagID}`, {
          posts: tagposts,
        }).catch(error => {
          console.log(error);
          alert("The tag could not be updated")
        });
      }).catch(error => {
        console.log(error);
        alert("The tag could not be updated")
      });
    }
  };

  addImage = (image, downloadURL, name, description) => {
    const images = this.state.images;
    const imageMeta = {
      key: Date.now(),
      name: name,
      description: description || "",
      contentType: image.uploadTaskSnapshot.metadata.contentType,
      bucket: image.uploadTaskSnapshot.metadata.bucket,
      fullPath: image.uploadTaskSnapshot.metadata.fullPath,
      downloadURL: downloadURL
    }
    images.push(imageMeta);
    return this.props.firebase.update(`posts/${this.props.match.params.id}`, {
      images: images
    }).then(result => {
      alert("Image added successfully");
    }).catch(error => {
      console.log(error);
    });
  }

  addTag = tag => (event) => {
    event.preventDefault();
    const newTagName = this.state.newTag;
    if (newTagName.length === 0) {
      return alert("The new tag name cannot be empty");
    }
    const newTag = {
      name: this.state.newTag,
      color: "#000"
    };
    this.props.firebase.push("tags", newTag).then(result => {
      console.log(result);
    }).catch(error => {
      console.log(error);
    })
  }


  onImageDelete = image => (event) => {
    event.preventDefault();
    const images = this.state.images;
    images.splice(images.indexOf(image), 1);
    // delete the file from storage
    this.props.firebase.deleteFile(image.fullPath, `images/${image.key}`)
      .catch(error => {
        alert('unable to delete the file from firebase storage');
        console.log(error);
      });
    // remove the relationship to the resource model
    this.props.firebase.update(`posts/${this.props.match.params.id}`, {
      images: images
    }).then(result => {
      alert("Image removed successfully");
    }).catch(error => {
      console.log(error);
    });
  }

  deletepost = post => (event) => {

    // delete post after confirmation
    const confirmation = window.confirm("Are you sure? This is permanent. You can always unpublish the post.");

    const resourceID = this.props.match.params.id;
    const images = this.state.images;
    const postTags = this.state.tags;
    const allTags = this.props.tags;

    if (confirmation) {
      this.props.firebase.remove(`posts/${resourceID}`)
        .then(result => {
          // Remove the images from Firebase Storage
          if (images && images.length) {
            images.forEach(img => {
              return this.props.firebase.deleteFile(img.fullPath);
            });
          }
          // Unbind all the relationships to this Post in Tags (but not the tags themselves)
          if (postTags && postTags.length) {
            postTags.forEach(tag => {
              // remove postID from allTags[tag].posts
              allTags[tag].posts.splice(allTags[tag].posts.indexOf(resourceID, 1));
              this.props.firebase.update(`tags/${tag}`, {
                posts: allTags[tag].posts
              }).catch(error => {
                console.log(error);
              });
            });
          }
        })
        .then(() => {
          alert("post deleted");
          this.props.history.push("/admin/dashboard/posts");
        })
        .catch(error => {
          console.log(error);
        })
    }
  }

  goBack = () => {
    this.props.history.push("/admin/dashboard/posts");
  }

  render() {
    const { post, tags } = this.props;
    const { name, snippet, content, isFeatured, isPublished, images, newTag, listImage, heroImage } = this.state;
    const existingTags = this.state.tags;

    if (!post) {
      return null;
    }

    return (
      <div className="page--container editor">
        <div className="page">
          <div className="flex flex-row">
            <div className="page-header--back-button flex flex-center" onClick={() => this.goBack()}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </div>
            <div className="page--header flex-1">
              <h1 className="page--title">
                <Typer text={"Edit Post " + name} delay={1200} interval={150} />
                <span className="blink">_</span>
              </h1>
            </div>
          </div>
          <div className="editor">
            { post
              ? <form onSubmit={this.updateResource}>
                  <div className={"editor--section editor--section-highlighted editor--control-panel page--content " + (this.state.stickyTopBar ? "editor--section-sticky-topbar" : "")}>
                    <div className="full-padding flex flex-row">
                      <div className="flex flex-center">
                        <div className="form-inline-checkbox flex flex-center">
                          <div className="checkbox" onClick={this.checkboxChange('isFeatured')}>
                            {isFeatured
                              ? <div className="checkmark">
                                  <FontAwesomeIcon icon={faCheck} />
                                </div>
                              : null
                            }
                          </div>
                          <label htmlFor="isFeatured">Featured</label>
                        </div>
                        <div className="form-inline-checkbox flex flex-center">
                          <div className="checkbox" onClick={this.checkboxChange('isPublished')}>
                            {isPublished
                              ? <div className="checkmark">
                                  <FontAwesomeIcon icon={faCheck} />
                                </div>
                              : null
                            }
                          </div>
                          <label htmlFor="isPublished">Published</label>
                        </div>
                      </div>
                      <div className="flex-1"></div>
                      <div className="flex flex-row flex-center">
                        <div className="delete-icon" onClick={this.deletepost()}>
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </div>
                        <button className="save-button" type="submit"> <FontAwesomeIcon icon={faCheck} /> </button>
                      </div>
                    </div>
                  </div>

                  {this.state.stickyTopBar
                    ? <div className="editor--section-sticky-placeholder"></div>
                    : null
                  }

                  <div className="editor--section page--content">
                    <h2>General Information</h2>
                    <label htmlFor="name">Name</label> <br />
                    <input className="text-input" name="name" type="text" value={name} onChange={this.inputChange('name')} />

                    <label htmlFor="snippet">Snippet (short list description)</label> <br />
                    <input className="text-input" name="snippet" type="text" value={snippet} onChange={this.inputChange('snippet')} />
                  </div>

                  <div className="editor--section page--content">
                    <h2>Images:</h2>
                    <label htmlFor="listImage">List Image URL</label> <br />
                    <input className="text-input" name="listImage" type="text" value={listImage} onChange={this.inputChange('listImage')} />

                    <label htmlFor="heroImage">Hero Image URL</label> <br />
                    <input className="text-input" name="heroImage" type="text" value={heroImage} onChange={this.inputChange('heroImage')} />
                    
                    { images &&
                      Object.keys(images).map((image, index) => {
                        return (
                          <div className="resource-image flex flex-row flex-center pad-vertical" key={index}>
                            <img src={images[image].downloadURL} alt={images[image].description} width="200px" />
                            <div className="flex-1 full-padding">
                              <p>
                                <span className="bold-text">{images[image].name}:</span> <br /> "{images[image].description}"
                              </p>
                              <small>{"http://jj-plus-plus.imgix.net/" + images[image].fullPath}</small>
                            </div>
                            
                            <button className="button delete-button" onClick={this.onImageDelete(images[image])}>Delete Image</button>
                          </div>
                        )
                      })
                    }
                    <Uploader addImage={(path, downloadURL, name, description) => this.addImage(path, downloadURL, name, description)}/>
                  </div>

                  <div className="editor--section page--content">
                    <h2>Content</h2>
                    <div className="markdown-editor">
                      <div className="markdown-editor--toggle flex flex-row">
                        <div onClick={() => this.setState({"showPreview": !this.state.showPreview})} className={"markdown-editor--toggle-option flex-1 " + (!this.state.showPreview ? "selected" : "")}>
                          <p>Editor</p>
                        </div>
                        <div onClick={() => this.setState({"showPreview": !this.state.showPreview})} className={"markdown-editor--toggle-option flex-1 " + (this.state.showPreview ? "selected" : "")}>
                          <p>Preview</p>
                        </div>
                      </div>
                      { this.state.showPreview
                        ? <ReactMarkdown className="markdown-editor--preview" source={content} renderers={{ code: CodeBlock }}/>
                        : <textarea className="markdown-editor--textarea" name="content" value={content} onChange={this.inputChange('content')} />
                      }
                    </div>
                  </div>

                  <div className="editor--section page--content">
                    <h2>Tag Editor</h2>
                    { tags &&
                      Object.keys(tags).map((value, index) => {
                        const tag = tags[value];
                        const isChecked = existingTags && existingTags.includes(value);

                        return (
                          <div className="tag-manager" key={index}>
                            <input type="checkbox" checked={isChecked} value={value} name={tag.name} key={value} onChange={this.handleTagCheckboxChange(value)} />
                            <label htmlFor={tag.name}>{tag.name}</label>
                          </div>
                        )
                      })
                    }
                    <p>Add a Tag</p>
                    <input name="newTag" type="text" value={newTag} onChange={this.inputChange('newTag')} />
                    <button onClick={this.addTag()}>Add</button>
                  </div>
                </form>
              : <p>loading...</p>
            }
          </div>
        </div>
      </div>
    )
  }
}

const enhance = compose(
  firebaseConnect(props => {
    return [
      { path: `posts/${props.match.params.id}` },
      'tags'
    ]
  }),
  connect(({ firebase }, props) => ({
    post: getVal(firebase, `data/posts/${props.match.params.id}`),
    tags: firebase.data.tags
  }))
)

export default enhance(PostEditor);
