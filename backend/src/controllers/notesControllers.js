import Note from "../model/Note.js"


export  async function getAllNotes(req,res)
{
     try {
          const notes = await Note.find().sort({createAt : -1});
          res.status(200).json(notes);
     } catch (error) {
          console.error("error in  getallnotes", error);
          res.status(500).json({message : "Internal server error"});
     }
}

export  async function getNoteById(req,res)
{
     try {
          const note = await Note.findById(req.params.id);
          if(!note) return res.status(404).json({message : "Note not found"});
          res.status(200).json(note); 
     } catch (error) {
          console.error("error in  getNoteById", error);
          res.status(500).json({message : "Internal server error"});
     }
}

export async function createNote(req,res)
{
     try {
          const {title,content} = req.body;
          const note = new Note({title,content});

          const savedNote = await note.save();
          res.status(201).json(savedNote);
     } catch (error) {
          console.error("error in createNote",error);
          res.status(500).json({message : "Internal server error"});
     }
}

export async function updateNote(req,res)
{
     try {
          const {title,content} = req.body;
          const updatedNote = await Note.findByIdAndUpdate(req.params.id,{title,content},{
               new:true,
          });

          if(!updatedNote) return res.status(404).json({message : "NOT FOUND"});

          res.status(200).json(updatedNote);
     } catch (error) {
          console.error("error in updateNote",error);
          res.status(500).json({message : "Internal server error"});
     }
}

export async function deleteNote(req,res){
     try {
          const deleteNote = await Note.findByIdAndDelete(req.params.id);
          if(!deleteNote) return res.status(404).json({message : "NOT FOUND"});
          res.status(200).json(deleteNote);
     } catch (error) {
          console.error("error in deleteNote",error);
          res.status(500).json({message : "Internal server error"});
     }
     
}