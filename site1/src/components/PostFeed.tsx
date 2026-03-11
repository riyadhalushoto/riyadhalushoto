import { useEffect, useState } from "react";
import { io } from "socket.io-client";
interface Comment {
  user: { _id: string; username: string; photoUrl?: string };
  text: string;
  createdAt: string;
}
interface Post {
  _id: string;
  title?: string;
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: string[];
  comments: Comment[];
  createdBy: { _id: string; username: string; photoUrl?: string };
  createdAt: string;
}
const socket = io("https://riyadhalushoto.onrender.com");
export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    loadPosts();
    socket.on("newPost", (post: Post) => {
      setPosts((prev) => [post, ...prev]);
    });
    socket.on("updatePost", (updated: Post) => {
      setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
    });
    return () => {
      socket.off("newPost");
      socket.off("updatePost");
    };
  }, []);
  async function loadPosts() {
    const res = await fetch("http://localhost:5000/posts");
    const data = await res.json();
    setPosts(data);
  }
  async function createPost() {
    if (!content && !media) return;
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("userId", userId || "");
    if (media) formData.append("media", media);
    const res = await fetch("http://localhost:5000/posts", {
      method: "POST",
      body: formData,
    });
    const post = await res.json();
    setPosts((prev) => [post, ...prev]);
    setTitle("");
    setContent("");
    setMedia(null);
  }
  async function toggleLike(postId: string) {
    const res = await fetch(`http://localhost:5000/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }
  async function addComment(postId: string, text: string) {
    const res = await fetch(`http://localhost:5000/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, text }),
    });
    const updated = await res.json();
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  }
  return (
    <div style={feedContainer}>
      <h2 style={{ color: "#d4af37", marginBottom: 20 }}>📢 Fil d'actualité</h2>
      <div style={createPostCard}>
        <input
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Dites quelque chose..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={textareaStyle}
        />
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setMedia(e.target.files?.[0] || null)}
        />
        <button onClick={createPost} style={btnStyle}>
          Publier
        </button>
      </div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          toggleLike={toggleLike}
          addComment={addComment}
        />
      ))}
    </div>
  );
}
function PostCard({ post, toggleLike, addComment }: any) {
  const [showAll, setShowAll] = useState(false);
  const comments = showAll ? post.comments : post.comments.slice(0, 3);
  return (
    <div style={postCard}>
      <div style={{ fontWeight: "bold", color: "#d4af37" }}>
        {post.createdBy?.username}
      </div>
      <p>{post.content}</p>
      {post.mediaUrl && (
        post.mediaType === "video" ? (
          <video
            src={`http://localhost:5000/uploads/${post.mediaUrl}`}
            controls
            style={mediaStyle}
          />
        ) : (
          <img
            src={`http://localhost:5000/uploads/${post.mediaUrl}`}
            style={mediaStyle}
          />
        )
      )}
      <button onClick={() => toggleLike(post._id)} style={actionBtn}>
        ❤️ {post.likes.length}
      </button>
      <div style={{ marginTop: 10 }}>
        {comments.map((c: any, i: number) => (
          <div key={i}>
            <strong>{c.user?.username}</strong> {c.text}
          </div>
        ))}
        {post.comments.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            style={{ marginTop: 5, fontSize: 12 }}
          >
            {showAll ? "Voir moins" : "Voir plus"}
          </button>
        )}
        <CommentInput postId={post._id} addComment={addComment} />
      </div>
    </div>
  );
}
function CommentInput({ postId, addComment }: any) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addComment(postId, text);
        setText("");
      }}
      style={{ display: "flex", marginTop: 8 }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Votre commentaire"
        style={commentInputStyle}
      />
      <button type="submit" style={commentBtnStyle}>
        Envoyer
      </button>
    </form>
  );
}
// ===== STYLES =====
const feedContainer: any = {
  flex: 1, // ← prend tout l’espace disponible dans le layout
  display: "flex",
  flexDirection: "column",
  padding: 20,
  maxWidth: 750,
  margin: "0 auto",
  color: "white",
  overflowY: "auto" // permet scroll si beaucoup de posts
};
const createPostCard: any = {
  background: "#02140f",
  padding: 0,
  borderRadius: 15,
  marginBottom: 20,
  border: "1px solid #1e293b",
  display: "flex",
  flexDirection: "column",
  gap: 10
};
const postCard: any = {
  background: "#02140f",
  padding: 20,
  borderRadius: 15,
  marginBottom: 20,
  border: "1px solid #1e293b"
};
const inputStyle: any = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #d4af37",
  marginBottom: 10,
  background: "#020617",
  color: "white",
  boxSizing: "border-box"
};
const textareaStyle: any = {
  width: "100%",
  padding: 12,
  borderRadius: 8,
  border: "1px solid #d4af37",
  marginBottom: 10,
  background: "#020617",
  color: "white",
  minHeight: 80,
  boxSizing: "border-box",
  resize: "none"
};
const btnStyle: any = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#d4af37",
  color: "#02140f",
  fontWeight: "bold",
  cursor: "pointer"
};
const mediaStyle: any = {
  width: "100%",
  display: "block",
  maxHeight: 750,
  objectFit: "contain",
  background: "#020617"
};
const actionBtn: any = {
  background: "none",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center"
};
const commentInputStyle: any = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 20,
  border: "1px solid #1e293b",
  background: "#0f172a",
  color: "white",
  fontSize: 13
};
const commentBtnStyle: any = {
  marginLeft: 8,
  padding: "8px 15px",
  borderRadius: 20,
  border: "none",
  background: "#d4af37",
  color: "#02140f",
  fontWeight: "bold",
  fontSize: 12,
  cursor: "pointer"
};
