const express = require('express');
const mongoose = require('mongoose');
const dbUri = 'mongodb://localhost:27017/games';
const bodyParser = require('body-parser');
const methodOverride = require('method-override');



const app = express();
const port = 3000;


mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;


//SCHEMA
const gameSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: String,
    minimumAge: Number,
    pricing: {
        hourly: String,
        perGame: String
    },
    image: {
        description: String,
        path: {
            type: String,
            required: false 
        }
    }
});


const Game = mongoose.model('games', gameSchema);


// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//     console.log('Connected to MongoDB');
// });

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//GET REQUESTS
app.get('/', (req, res) => {
    res.redirect('/games');
});
app.get('/games/new', (req, res) => {
    res.render('new'); 
});

app.get('/games/search', (req, res) => {
    const title = req.query.title;
    const type = req.query.type;

    if (title !== undefined && type==="") {
        // type === "No filter"
        // Find based on title only
        // const regex = new RegExp(`.*${title}.*`, 'i');
        Game.find({ name: {$regex:title, $options:"i" }})
            .exec()
            .then(games => {
                // console.log("inside search with name");
                // res.json(games);
                res.render('index', { games,title,type });
                        })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error fetching games');
            });
    } 
    else if (title===undefined && type !== undefined) {
        // Find based on type only
        Game.find({ type: type })
            .exec()
            .then(games => {
                // console.log("inside search with title");
                // res.json(games);
                res.render('index', { games,title,type });
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error fetching games');
            });
    }else if (title !== undefined && (type !== undefined) ){
        // Find based on both title and type
        // const regex = new RegExp(`.*${title}.*`, 'i');
        Game.find({ name: {$regex:title, $options:"i" }, type: type })
            .exec()
            .then(games => {
                // console.log("inside search with both");
                // res.json(games);
                res.render('index', { games,title,type });
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Error fetching games');
            });
    }  else {
        Game.find({})
        .exec()
        .then(games => {
            res.render('index', { games,title,type}); 
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching games');
        });
    }
});

app.get('/games/:id', (req, res) => {
    const id = req.params.id;
    Game.findById(id)
      .then(result => {
        
          res.render('gamedetails', { result });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("An error occurred");
      });
  });
      
app.get('/games', (req, res) => {
    const title ="";
    const type="";
    Game.find({})
        .exec()
        .then(games => {
            res.render('index', { games,title,type }); 
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error fetching games');
        });
});
app.get('/games/:id/edit',(req,res)=>{
    const id = req.params.id;
    Game.findById(id)
      .then(result => {
        
          res.render('editgame', { result });
      })
      .catch(error => {
        console.error(error);
        res.status(500).send("An error occurred");
      });

})




//PUT REQUESTS
app.put('/games/:id', (req, res) => {
    const id = req.params.id;
    const updatedGame = req.body;

    Game.findByIdAndUpdate(id, {
        name: updatedGame.name,
        description: updatedGame.description,
        type: updatedGame.type,
        minimumAge: updatedGame.minimumAge,
        pricing: {
            hourly: updatedGame.hourlyPricing,
            perGame: updatedGame.perGamePricing
        },
        image: {
            description: updatedGame.imageAltText,
            path: updatedGame.imagePath
        }
    }, { new: true }) 
    .then(updatedGameDoc => {
        res.json(updatedGameDoc);
    })
    .catch(err => {
        console.error("Error updating game:", err);
    });
});



// POST REQUESTS
app.post('/create', (req, res) => {
   
    const formData = req.body;
    const newGame = new Game({
        name: formData.title,
        description: formData.description,
        type: formData.type,
        minimumAge: formData.minimumAge,
        pricing: {
            hourly: formData.hourlyPricing,
            perGame: formData.perGamePricing
        },
        image: {
            description: formData.imageAltText,
            path: formData.imagePath
        }
    });

    newGame.save()
        .then(() => {
            res.redirect('/games');
        })
        .catch((err) => {
            console.error(err);
            res.send('Error occurred while saving the game.');
        });
});

// DELETE REQUESTS

app.delete('/games/:id',(req,res)=>{
    const id= req.params.id;
    Game.findByIdAndDelete(id)
        .then(result=>{
            res.json({redirect:'/games'})
        })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});