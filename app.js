
import express from "express";
import mongoose from "mongoose";
import _ from "lodash";
import pkg from "dotenv"
pkg.config();

const app = express();

mongoose.connect(process.env.TODODB);
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine','ejs');



const taskSchema = {
    name: {
        type: String,
        maxlength: 50,
        required: [true,"pls check your data entry, no name is specified."]
    }
};

const listSchema = {
    name: {
        type: String,
        maxlength: 50,
        required: [true,"pls check your data entry, no name is specified."]
    },
    listItem: [taskSchema]
};

const TaskMaker = mongoose.model("task",taskSchema);
const ListMaker = mongoose.model("list",listSchema);
const intro = new TaskMaker({
    name: " <-- To delete , To add (+)"
});




const date = new Date();
const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
};

// This method takes locale(region) & options(format) as an argument.
const day = date.toLocaleDateString('en-US',options);




app.get("/", (req, res)=>{
    TaskMaker.find((err,result)=>{
        if(err){
            console.log(err);
        }else{
            if(result.length === 0){
                intro.save();
                res.redirect("/");
            }else{
                res.render('index',{header: day,Items: result});
            }
        }
    });
});


app.get("/:customList",(req ,res)=>{
    const listName = _.capitalize(req.params.customList);
    ListMaker.findOne({name: listName},(err,found)=>{
        if(err){
            console.log(err);
        }else{
            if(!found){
                const list = new ListMaker({
                    name: listName,
                    listItem: [intro]
                });
                list.save();
                res.redirect("/"+listName);
            }else{
                res.render("index",{header: found.name, Items: found.listItem});
                }
        } 
    });
});


app.post("/add",(req, res)=>{
    const listName = req.body.button;
    const item = req.body.item;
    const newTask = new TaskMaker({
        name: item
    });

    if(listName===day){
        newTask.save();
        res.redirect("/");
    }else{
        ListMaker.findOne({name: listName},(err,found)=>{
            if(err){
                console.log(err);
            }else{
                found.listItem.push(newTask);
                found.save();
                res.redirect("/"+found.name);
            }
        });  
    }
});


app.post("/delete",(req, res)=>{
    const listName = req.body.header;
    const itemId = req.body.checked;

    if(listName===day){
        TaskMaker.deleteOne({_id: itemId},(err)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect("/");
            }
        });
    }else{
        ListMaker.findOneAndUpdate({name: listName},{$pull: {listItem: {_id: itemId}}},(err, result)=>{
            if(err){
                console.log(err);
            }else{
                res.redirect("/"+listName);
            }
        });
    }  
});





app.listen(3000, ()=>{
    console.log("server is running on port 3000");
});


// Todo-tasks&lists = Database-Collection
// Deepak-deepaks9867 = Username-Password
// mongosh "mongodb+srv://cluster0.yzmvm.mongodb.net/Todo" --username Deepak